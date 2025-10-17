<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AddressController extends Controller
{
    public function index()
    {
        $addresses = Address::where('user_id', auth()->id())
            ->where('is_active', true)
            ->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($addresses);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'nullable|string|max:255',
            'street' => 'required|string|max:255',
            'number' => 'required|string|max:20',
            'complement' => 'nullable|string|max:255',
            'neighborhood' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:2',
            'zipcode' => 'required|string|max:10',
            'notes' => 'nullable|string',
            'is_default' => 'boolean'
        ]);

        try {
            DB::beginTransaction();

            // Se este endereço for marcado como padrão, remover o padrão dos outros
            if ($request->is_default) {
                Address::where('user_id', auth()->id())
                    ->update(['is_default' => false]);
            }

            $address = Address::create([
                'user_id' => auth()->id(),
                'name' => $request->name,
                'street' => $request->street,
                'number' => $request->number,
                'complement' => $request->complement,
                'neighborhood' => $request->neighborhood,
                'city' => $request->city,
                'state' => $request->state,
                'zipcode' => $request->zipcode,
                'notes' => $request->notes,
                'is_default' => $request->is_default ?? false
            ]);

            DB::commit();

            return response()->json($address, 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erro ao criar endereço: ' . $e->getMessage()], 422);
        }
    }

    public function show(Address $address)
    {
        // Verificar se o endereço pertence ao usuário
        if ($address->user_id !== auth()->id()) {
            return response()->json(['message' => 'Endereço não encontrado'], 404);
        }

        return response()->json($address);
    }

    public function update(Request $request, Address $address)
    {
        // Verificar se o endereço pertence ao usuário
        if ($address->user_id !== auth()->id()) {
            return response()->json(['message' => 'Endereço não encontrado'], 404);
        }

        $request->validate([
            'name' => 'nullable|string|max:255',
            'street' => 'required|string|max:255',
            'number' => 'required|string|max:20',
            'complement' => 'nullable|string|max:255',
            'neighborhood' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:2',
            'zipcode' => 'required|string|max:10',
            'notes' => 'nullable|string',
            'is_default' => 'boolean'
        ]);

        try {
            DB::beginTransaction();

            // Se este endereço for marcado como padrão, remover o padrão dos outros
            if ($request->is_default) {
                Address::where('user_id', auth()->id())
                    ->where('id', '!=', $address->id)
                    ->update(['is_default' => false]);
            }

            $address->update($request->all());

            DB::commit();

            return response()->json($address);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erro ao atualizar endereço: ' . $e->getMessage()], 422);
        }
    }

    public function destroy(Address $address)
    {
        // Verificar se o endereço pertence ao usuário
        if ($address->user_id !== auth()->id()) {
            return response()->json(['message' => 'Endereço não encontrado'], 404);
        }

        // Verificar se o endereço está sendo usado em pedidos
        if ($address->orders()->exists()) {
            return response()->json(['message' => 'Não é possível excluir endereço que está sendo usado em pedidos'], 422);
        }

        $address->delete();

        return response()->json(['message' => 'Endereço excluído com sucesso']);
    }

    public function setDefault(Address $address)
    {
        // Verificar se o endereço pertence ao usuário
        if ($address->user_id !== auth()->id()) {
            return response()->json(['message' => 'Endereço não encontrado'], 404);
        }

        try {
            DB::beginTransaction();

            // Remover padrão dos outros endereços
            Address::where('user_id', auth()->id())
                ->where('id', '!=', $address->id)
                ->update(['is_default' => false]);

            // Definir este como padrão
            $address->update(['is_default' => true]);

            DB::commit();

            return response()->json(['message' => 'Endereço definido como padrão']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erro ao definir endereço padrão: ' . $e->getMessage()], 422);
        }
    }
}