import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../configs/api'

const VerifyEmail = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [status, setStatus] = useState('verifying') // 'verifying' | 'success' | 'error'
    const [message, setMessage] = useState('')

    useEffect(() => {
        const token = searchParams.get('token')
        if (!token) {
            setStatus('error')
            setMessage('Verification link is invalid.')
            return
        }

        api.get(`/api/users/verify-email?token=${token}`)
            .then(({ data }) => {
                setStatus('success')
                setMessage(data.message)
            })
            .catch((err) => {
                setStatus('error')
                setMessage(err?.response?.data?.message || 'Verification failed. Please try again.')
            })
    }, [])

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-white border border-gray-200 rounded-2xl p-10 max-w-sm w-full text-center shadow-sm">
                {status === 'verifying' && (
                    <>
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Verifying your email...</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <div className="text-4xl mb-4">✓</div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Email Verified!</h2>
                        <p className="text-gray-500 text-sm mb-6">{message}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full h-11 rounded-full text-white bg-green-500 hover:opacity-90 transition-opacity"
                        >
                            Go to Login
                        </button>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <div className="text-4xl mb-4">✕</div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Verification Failed</h2>
                        <p className="text-gray-500 text-sm mb-6">{message}</p>
                        <button
                            onClick={() => navigate('/login?state=register')}
                            className="w-full h-11 rounded-full text-white bg-indigo-500 hover:opacity-90 transition-opacity"
                        >
                            Register Again
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

export default VerifyEmail
