<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EmployeeAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check() || !in_array(auth()->user()->type, ['admin', 'employee'])) {
            return response()->json(['message' => 'Acesso não autorizado'], 403);
        }

        return $next($request);
    }
}
