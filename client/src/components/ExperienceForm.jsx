import { Briefcase, Loader2, Plus, Sparkles, Trash2, Undo2 } from 'lucide-react'
import api from '../configs/api';
import toast from 'react-hot-toast';
import { useEffect, useRef, useState } from 'react';


const ExperienceForm = ({ data, onChange }) => {
    const [generatingIndex, setGeneratingIndex] = useState(-1);
    // Map of index → previous description value, cleared after 10s
    const [undoMap, setUndoMap] = useState({});
    const undoTimersRef = useRef({});

    useEffect(() => {
        return () => Object.values(undoTimersRef.current).forEach(clearTimeout);
    }, []);

    const addExperience = () => {
        const newExperience = {
            company: '',
            position: '',
            start_date: '',
            end_date: '',
            description: '',
            is_current: false,
        };
        onChange([...data, newExperience])
    }

    const removeExperience = (index) => {
        const updated = data.filter((_, i) => i !== index);
        onChange(updated);
    }

    const updateExperience = (index, field, value) => {
        const updated = [...data];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    }

    const generateDescription = async (index) => {
        setGeneratingIndex(index);
        const experience = data[index];
        const snapshot = experience.description;
        const prompt = `Enhance the job description for a position as ${experience.position} at ${experience.company} with the following responsibilities: ${experience.description}`;
        try {
            const { data: resData } = await api.post('/api/ai/enhance-job-desc', { userContent: prompt })
            updateExperience(index, 'description', resData.enhancedContent);
            setUndoMap(prev => ({ ...prev, [index]: snapshot }));
            clearTimeout(undoTimersRef.current[index]);
            undoTimersRef.current[index] = setTimeout(() => {
                setUndoMap(prev => { const next = { ...prev }; delete next[index]; return next; });
            }, 10000);
        } catch (error) {
            toast.error(error.userMessage || error.message)
        } finally {
            setGeneratingIndex(-1)
        }
    }

    const handleUndo = (index) => {
        updateExperience(index, 'description', undoMap[index]);
        setUndoMap(prev => { const next = { ...prev }; delete next[index]; return next; });
        clearTimeout(undoTimersRef.current[index]);
    }

    return (
        <div className='space-y-4'>
            <div className="flex items-center justify-between">
                <div className="">
                    <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'>Professional Experience</h3>
                    <p className='text-sm text-gray-500'>Add your job experience</p>
                </div>
                <button onClick={addExperience} className='flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors'>
                    <Plus className='size-4' /> Add Experience
                </button>
            </div>
            {data.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                    <Briefcase className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                    <p>No work experience added yet.</p>
                    <p className='text-sm'> Click "Add Experience" to get started.</p>
                </div>
            ) : (
                <div className=" mt-6 space-y-6">
                    {data.map((experience, index) => (
                        <div key={index} className="p-4 border border-gray-300 rounded-lg space-y-3">
                            <div className=" flex justify-between items-start">
                                <h4>Experience #{index + 1}</h4>
                                <button onClick={() => removeExperience(index)} className='text-red-500 hover:text-red-700 transition-colors'>
                                    <Trash2 className='size-4' />
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-3">
                                <input type="text" value={experience.company || " "} onChange={(e) => updateExperience(index, "company", e.target.value)} placeholder='Company Name' className='px-3 py-2 text-sm rounded-lg' />
                                <input type="text" value={experience.position || " "} onChange={(e) => updateExperience(index, "position", e.target.value)} placeholder='Position' className='px-3 py-2 text-sm rounded-lg' />
                                <input type="month" value={experience.start_date || ""} onChange={(e) => updateExperience(index, "start_date", e.target.value)} className='px-3 py-2 text-sm rounded-lg' />
                                <input type="month" value={experience.end_date || ""} onChange={(e) => updateExperience(index, "end_date", e.target.value)} className='px-3 py-2 text-sm rounded-lg disabled:bg-gray-100' disabled={experience.is_current} />
                            </div>
                            <label className='flex items-center gap-2'>
                                <input type="checkbox" onChange={(e) => updateExperience(index, "is_current", e.target.checked ? true : false)} checked={experience.is_current || false} className='rounded border-gray-300 text-blue-600 focus:ring-blue-500' />
                                <span className='text-sm text-gray-700'>Currently working here</span>
                            </label>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className='text-sm font-medium text-gray-700'>Job Description</label>
                                    <div className="flex items-center gap-2">
                                        {undoMap[index] !== undefined && (
                                            <button onClick={() => handleUndo(index)} className='flex items-center gap-1 px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors'>
                                                <Undo2 className='w-3 h-3' /> Undo
                                            </button>
                                        )}
                                        <button onClick={() => generateDescription(index)} disabled={generatingIndex === index || !experience.position || !experience.company} className='flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50'>
                                            {generatingIndex === index ? (
                                                <Loader2 className='w-3 h-3 animate-spin' />
                                            ) : (
                                                <Sparkles className='w-3 h-3' />
                                            )}
                                            Enhance with AI
                                        </button>
                                    </div>
                                </div>
                                <textarea rows={8} value={experience.description || ""} onChange={(e) => updateExperience(index, "description", e.target.value)} className='w-full text-sm px-3 py-2 rounded-lg resize-none' placeholder='Describe your key responsibilities and achievements...' />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ExperienceForm