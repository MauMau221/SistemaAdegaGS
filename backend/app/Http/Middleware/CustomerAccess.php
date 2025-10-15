<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CustomerAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->user()->type !== 'customer') {
            return response()->json(['message' => 'Acesso não autorizado'], 403);
        }

        return $next($request);
    }
}