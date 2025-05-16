import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { SessionPrice } from '../types/session';
import { API_ENDPOINTS } from '../config/api';

interface SessionsBundle {
    id: number;
    quantity: number;
    price: number;
    description: number;
}

const BuySessions: React.FC = () => {
    const [sessionBundles, setSessionBundles] = useState<SessionsBundle[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSessionPrices = async () => {
            try {
                const response = await axios.get<SessionsBundle[]>(
                    API_ENDPOINTS.SESSIONS.BUNDLES,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
                );
                setSessionBundles(response.data);
            } catch (error) {
                console.error('Error fetching session prices:', error);
                setError('Erro ao carregar os pacotes de sessões');
            }
        };

        fetchSessionPrices();
    }, []);
    
    const handlePurchase = async (bundleId: number) => {
        setLoading(true);
        try {
            const response = await axios.post(API_ENDPOINTS.PAYMENT.CREATE, null, { params: { bundle_id: bundleId } });
            if (response.status !== 200) {
                setError('Erro ao iniciar o pagamento. Tente novamente.');
                return;
            }
            // Redirect to payment gateway
            window.location.href = response.data.init_point;
        } catch (error) {
            setError('Erro ao iniciar o pagamento. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 mt-5">
            <div className="text-center">
                <h2 className="text-3xl font-extrabold text-gray-900">
                    Comprar Sessões
                </h2>
                <p className="mt-4 text-lg text-gray-500">
                    Escolha a quantidade de sessões que deseja adquirir
                </p>
            </div>
            {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-3" role="alert">
                <span className="block sm:inline">{error}</span>
            </div>
            )}
            <div className="mt-5 grid gap-8 md:grid-cols-3">
                {sessionBundles.map((bundle) => (
                    <div key={bundle.id} className="border rounded-lg p-6 shadow-sm">
                        <h3 className="text-2xl font-bold">{bundle.quantity} {bundle.quantity == 1 ? 'Sessão' : 'Sessões'}</h3>
                        <p className="mt-4">
                            <span className="text-4xl font-bold">
                                R$ {bundle.price}
                            </span> 
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            R$ {bundle.price / bundle.quantity} por sessão
                        </p>
                        <button
                            onClick={() => handlePurchase(bundle.id)}
                            disabled={loading}
                            className="mt-8 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Processando...' : 'Comprar Agora'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BuySessions;