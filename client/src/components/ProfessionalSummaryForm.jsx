import { Loader2, Sparkles, Undo2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react';
import api from '../configs/api';
import toast from 'react-hot-toast';

const ProfessionalSummaryForm = ({ data, onChange, setResumeData }) => {

    const [isGenerating, setIsGenerating] = useState(false);
    const [previousValue, setPreviousValue] = useState(null);
    const undoTimerRef = useRef(null);

    useEffect(() => {
        return () => clearTimeout(undoTimerRef.current);
    }, []);

    const generateSummary = async () => {
        try {
            setIsGenerating(true);
            const snapshot = data;
            const prompt = `Enhance my professional summary " ${data}"`;
            const response = await api.post('/api/ai/enhance-pro-sum', { userContent: prompt })
            setResumeData(prev => ({ ...prev, professional_summary: response.data.enhancedContent }))
            setPreviousValue(snapshot);
            clearTimeout(undoTimerRef.current);
            undoTimerRef.current = setTimeout(() => setPreviousValue(null), 10000);
        } catch (error) {
            toast.error(error.userMessage || error.message)
        } finally {
            setIsGenerating(false);
        }
    }

    const handleUndo = () => {
        setResumeData(prev => ({ ...prev, professional_summary: previousValue }));
        setPreviousValue(null);
        clearTimeout(undoTimerRef.current);
    }

    return (
        <div className='space-y-4'>
            <div className="flex items-center justify-between">
                <div className="">
                    <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'>Professional Summary</h3>
                    <p className='text-sm text-gray-500'>Add summary for your resume here</p>
                </div>
                <div className="flex items-center gap-2">
                    {previousValue !== null && (
                        <button onClick={handleUndo} className='flex items-center gap-1 px-3 py-1 text-sm bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors'>
                            <Undo2 className='size-3.5' /> Undo
                        </button>
                    )}
                    <button disabled={isGenerating} onClick={generateSummary} className='flex items-center gap-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50'>
                        {isGenerating ? (
                            <Loader2 className='size-4 animate-spin' />
                        ) : (
                            <Sparkles className='size-4' />
                        )}
                        {isGenerating ? "Enhancing..." : "Enhance with AI"}
                    </button>
                </div>
            </div>
            <div className="mt-6">
                <textarea rows={7} value={data || ""} onChange={(e) => onChange(e.target.value)} placeholder='Write a compelling professional summary that highlights your key strengeths and careers objectives...' className='w-full p-3 px-4 mt-2 border text-sm border-gray-300 rounded-lg focus:ring focus:ring-blue-500 focus:border-blue-500 outline-none transition-none resize-none' />
                <p className='text-xs text-gray-500 max-w-4/5 mx-auto text-center'>Tip: Keep it concise (3-4 sentences) and focus on your most relevant achievements and skills.</p>
            </div>
        </div>
    )
}

export default ProfessionalSummaryForm