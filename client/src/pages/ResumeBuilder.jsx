import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { dummyResumeData } from '../assets/assets';
import { ArrowLeftIcon, Briefcase, FileText, FolderIcon, GraduationCap, Sparkles, User, ChevronLeft, ChevronRight } from 'lucide-react';
import PersonalInfoForm from '../components/PersonalInfoForm';
import ResumePreview from '../components/ResumePreview';
import TemeplateSelector from '../components/TemeplateSelector';
import ColorPicker from '../components/ColorPicker';

const ResumeBuilder = () => {
    const { resumeId } = useParams();
    const [activeSectionIndex, setActiveSectionIndex] = useState(0);
    const [removeBackground, setRemoveBackground] = useState(false);
    const [resumeData, setResumeData] = useState({
        _id: '',
        title: '',
        personal_info: {},
        professional_summary: "",
        experience: [],
        education: [],
        skills: [],
        template: 'classic',
        accent_color: '#3B82F6',
        public: false,
    })
    const sections = [
        { id: 'personal', name: 'Personal Info', icon: User },
        { id: 'summary', name: 'Summary', icon: FileText },
        { id: ' experience', name: 'Experience', icon: Briefcase },
        { id: 'education', name: 'Education', icon: GraduationCap },
        { id: 'projects', name: 'Projects', icon: FolderIcon },
        { id: 'skills', name: 'Skills', icon: Sparkles },
    ];

    const activeSection = sections[activeSectionIndex]

    useEffect(() => {
        if (!resumeId) return;
        const resume = dummyResumeData.find(r => r._id === resumeId);
        if (resume) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setResumeData(resume);
            document.title = resume.title;
        }
    }, [resumeId])

    return (
        <div >
            <div className="max-w-7xl mx-auto px-4 py-6 flex">
                <Link to={'/app'} className='inline-flex gap-2 items-center text-slate-500 hover:text-slate-700 transition-all'>
                    <ArrowLeftIcon className='size-4' /> Back to Dashboard
                </Link>
            </div>
            <div className="max-w-7xl mx-auto px-4 pb-8">
                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Left Panel */}
                    <div className="relative lg:col-span-5 rounded-lg overflow-hidden">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 pt-1">
                            <hr className="absolute top-0 lef-0 right-0 border-2 border-gray-200" />
                            <hr className="absolute top-0 left-0 h-1 bg-linear-to-r from-green-500 to-green-600 border-none transition-all duration-2000" style={{ width: `${activeSectionIndex * 100 / (sections.length - 1)}%` }} />

                            {/* Section Navigation */}
                            <div className="flex justify-between items-centers mb-6 border-b border-gray-300 py-1">
                                <div className='flex items-center gap-2'>
                                    <TemeplateSelector selectedTemplate={resumeData.template} onChange={(template) => setResumeData(prev => ({ ...prev, template }))} />
                                    <ColorPicker selectedColor={resumeData.accent_color} onChange={(accent_color) => setResumeData(prev => ({ ...prev, accent_color }))} />
                                </div>
                                <div className='flex items-center'>
                                    {activeSectionIndex !== 0 && (
                                        <button onClick={() => setActiveSectionIndex((prevIndex) => Math.max(prevIndex - 1, 0))} disabled={activeSectionIndex === 0} className='flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all'>
                                            <ChevronLeft className='size-4' /> Previous
                                        </button>
                                    )}
                                    <button onClick={() => setActiveSectionIndex((prevIndex) => Math.min(prevIndex + 1, sections.length - 1))} disabled={activeSectionIndex === sections.length - 1} className={`flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all ${activeSectionIndex === sections.length - 1 && 'opacity-50'}`}>
                                        Next <ChevronRight className='size-4' />
                                    </button>
                                </div>
                            </div>

                            {/* Form Content */}
                            <div className="space-y-6">
                                {activeSection.id === 'personal' && (
                                    <PersonalInfoForm data={resumeData.personal_info} onChange={(data) => setResumeData(prev => ({ ...prev, personal_info: data }))} removeBackground={removeBackground} setRemoveBackground={setRemoveBackground} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="lg:col-span-7 max-lg:mt-6">
                        <div className="">
                            {/* Buttons */}
                        </div>
                        {/* Resume Preview */}
                        <ResumePreview data={resumeData} template={resumeData.template} accentColor={resumeData.accent_color} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ResumeBuilder