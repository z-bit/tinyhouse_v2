type Body<TVars> = {
    query: string,
    variables?: TVars
}

type Error = {
    message: string
}

export const server = {
    
    fetch: async <TData = any, TVars = any>(body: Body<TVars>) => {
        const res = await fetch('/api', 
        // works because of "proxy": "http://localhost:9000" in package.json
        // redirects to "proxy": "http://localhost:9000/api" 
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            }
        )
    
        if(!res.ok) {
            throw new Error('Failed to fetch from server (HTTP-Error)')
            // GraphQL errors come here also with 400 Bad Request
        }

        // throw new Error('Error-Test')

        return res.json() as Promise<{
            data: TData,
            errors: Error[]
        }>
    } 
    
    
}

