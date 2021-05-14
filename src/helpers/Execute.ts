/**
 * for graphql requests
 */

import { processServerError } from './ProcessServerError'

export async function executeSRV<R, T = Record<string, string>, V = Record<string, string>>(
    service_url: string,
    operation: string,
    variables?: T,
    admin_secret?: string,
    session_variables?: V,
): Promise<R | undefined> {
    const headers: Record<string, string> = {}
    if (admin_secret) {
        headers['x-hasura-admin-secret'] = admin_secret
    }
    const operationName = operation.split('{', 1)[0].trim().split(' ')?.[1].trim()
    try {
        const fetchResponse = await fetch(service_url, {
            method: 'POST',
            headers: {
                ...headers,
                'content-encoding': 'gzip',
                'Content-Type': 'application/json',
                ...session_variables,
            },
            body: JSON.stringify({
                operationName,
                query: operation,
                variables: variables ?? null,
            }),
        })

        const data = await fetchResponse.json()

        if (data.errors) {
            processServerError(data.errors,operationName)
        }
        return data
    } catch (e) {
        processServerError(e,operationName)
        return
        //console.error(e)
    }
    //console.log('DEBUG: ', JSON.stringify(data));
}

export function executeFE<R = unknown, T = unknown, K = unknown>(
    operation: string,
    service_url: string,
    variables?: T,
    headers?: K,
) {
    return executeSRV<R, T, K>(service_url, operation, variables, undefined, headers)
}
