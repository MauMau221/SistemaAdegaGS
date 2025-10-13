<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use MercadoPago\SDK;
use MercadoPago\Payment as MPPayment;
use MercadoPago\Payer;

class PaymentController extends Controller
{
    public function __construct()
    {
        SDK::setAccessToken(config('services.mercadopago.access_token'));
    }

    public function generatePixPayment(Order $order)
    {
        try {
            $payment = new MPPayment();
            $payment->transaction_amount = $order->total_amount;
            $payment->description = "Pedido #{$order->order_number}";
            $payment->payment_method_id = "pix";
            $payment->payer = $this->createPayer($order);

            $payment->save();

            // Salvar pagamento no banco
            $localPayment = Payment::create([
                'order_id' => $order->id,
                'transaction_id' => $payment->id,
                'payment_method' => 'pix',
                'status' => 'pending',
                'amount' => $order->total_amount,
                'payment_details' => [
                    'qr_code' => $payment->point_of_interaction->transaction_data->qr_code,
                    'qr_code_base64' => $payment->point_of_interaction->transaction_data->qr_code_base64
                ]
            ]);

            return response()->json([
                'payment_id' => $payment->id,
                'qr_code' => $payment->point_of_interaction->transaction_data->qr_code,
                'qr_code_base64' => $payment->point_of_interaction->transaction_data->qr_code_base64
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function processCardPayment(Request $request, Order $order)
    {
        $request->validate([
            'token' => 'required|string',
            'installments' => 'required|integer|min:1',
            'payment_method_id' => 'required|string'
        ]);

        try {
            $payment = new MPPayment();
            $payment->transaction_amount = $order->total_amount;
            $payment->token = $request->token;
            $payment->description = "Pedido #{$order->order_number}";
            $payment->installments = $request->installments;
            $payment->payment_method_id = $request->payment_method_id;
            $payment->payer = $this->createPayer($order);

            $payment->save();

            // Salvar pagamento no banco
            $localPayment = Payment::create([
                'order_id' => $order->id,
                'transaction_id' => $payment->id,
                'payment_method' => 'credit_card',
                'status' => $payment->status,
                'amount' => $order->total_amount,
                'payment_details' => [
                    'installments' => $request->installments,
                    'payment_method_id' => $request->payment_method_id,
                    'status_detail' => $payment->status_detail
                ]
            ]);

            if ($payment->status === 'approved') {
                $localPayment->markAsApproved();
            }

            return response()->json([
                'status' => $payment->status,
                'status_detail' => $payment->status_detail,
                'payment_id' => $payment->id
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function webhook(Request $request)
    {
        try {
            if ($request->type === 'payment') {
                $payment = MPPayment::find_by_id($request->data->id);
                $localPayment = Payment::where('transaction_id', $payment->id)->first();

                if ($localPayment) {
                    $localPayment->status = $payment->status;
                    $localPayment->payment_details = array_merge(
                        $localPayment->payment_details ?? [],
                        ['status_detail' => $payment->status_detail]
                    );
                    $localPayment->save();

                    if ($payment->status === 'approved') {
                        $localPayment->markAsApproved();
                        $localPayment->createFinancialTransaction();
                    }
                }
            }

            return response()->json(['status' => 'success']);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    private function createPayer(Order $order)
    {
        $payer = new Payer();
        $payer->email = $order->user->email;
        $payer->first_name = explode(' ', $order->user->name)[0];
        $payer->last_name = substr(strstr($order->user->name, ' '), 1);
        
        return $payer;
    }
}
