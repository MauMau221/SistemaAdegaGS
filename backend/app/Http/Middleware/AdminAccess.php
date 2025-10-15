<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminAccess
{
    public function handle(Request $request, Closure $next)
    {
        if (!auth()->check()) {
            return response()->json(['message' => 'Token não fornecido'], 401);
        }

        if (!auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Acesso não autorizado'], 403);
        }

        return $next($request);
    }
}
