import { 
//    useState, 
    useEffect, 
    useCallback, 
    useReducer 
} from 'react'
import { server } from './server'
import { fetchReducer, State, initialState } from './fetchReducer'

interface QueryResult<TData> extends State<TData> {
    refetch: () => void
} 

export const useQuery = <TData = any>(query: string): QueryResult<TData> => {

    //const [state, setState] = useState<State<TData>>(initialState)
    const reducer = fetchReducer<TData>()
    const [state, dispatch] = useReducer(reducer, initialState)

    const fetch = useCallback(() => {    
        const fetchApi = async () => {
            try {
                //setState({ data: null, loading: true, error: false })
                dispatch({ type: 'FETCH' })
                const { data, errors } = await server.fetch<TData>({ query })

                if (errors && errors.length) {
                    //HTTP successful but no data just errors array
                    throw new Error(errors[0].message)
                }

                //setState({ data, loading: false, error: false })
                dispatch({ type: 'FETCH_SUCCESS', payload: data })
            } catch (err) {
                // includes alse errors thrown bt server.ts
                //setState({data: null, loading: false, error: true })
                dispatch({ type: 'FETCH_ERROR' })
                throw console.error(err)
            }
        }
        fetchApi()
    }, [query])

    useEffect(() => fetch(), [fetch])

    return { ...state, refetch: fetch }   
}

/* 
 * * fetchApi is needed outside of useEffect hook, so it can be returned 
 *   to be used by the calling component
 * 
 * * useEffect depends on fetchApi, but fetchApi can not be a listed 
 *   dependency of useEffect, since it lives outside useEffect
 * 
 * * useCallback is called when hook is initiated
 *      * it memoizes its results in fetch
 *      * it is triggered when query changes (query never changes!!)
 *      * so it runs exactly onces
 * 
 * * useEffect can now call the memoized fetch function and also 
 *   list it as its dependency, as it is now within useEffect
 * 
*/


// gone to fetchReducer.ts
// type State<TData> = {
//     data: TData | null
//     loading: boolean
//     error: boolean
// }
// const initialState = {
//     data: null,
//     loading: false,
//     error: false, 
// }
// type Action<TData> = 
//     | { type: 'FETCH'}
//     | { type: 'FETCH_SUCCESS', payload: TData }
//     | { type: 'FETCH_ERROR'}
// const fetchReducer = <TData>() => (state: State<TData>, action: Action<TData>): State<TData> => {
//     switch (action.type) {
//         case 'FETCH':
//             return { ...state, loading: true }
//         case 'FETCH_SUCCESS':
//             return { data: action.payload, loading: false, error: false }
//         case 'FETCH_ERROR':
//             return { data: null, loading: false, error: true } 
//     }
// }
