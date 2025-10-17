<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CustomerAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();
        
        // Se não há usuário autenticado
        if (!$user) {
            return response()->json(['message' => 'Não autenticado'], 401);
        }
        
        // Permite acesso para customers ou usuários sem tipo definido (usuários antigos)
        if ($user->type && $user->type !== 'customer') {
            return response()->json(['message' => 'Acesso não autorizado'], 403);
        }

        return $next($request);
    }
}