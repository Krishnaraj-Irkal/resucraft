import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeftIcon, Briefcase, FileText, FolderIcon, GraduationCap, Sparkles, User, ChevronLeft, ChevronRight, Share2Icon, EyeIcon, EyeOffIcon, DownloadIcon } from 'lucide-react';
import PersonalInfoForm from '../components/PersonalInfoForm';
import ResumePreview from '../components/ResumePreview';
import TemplateSelector from '../components/TemplateSelector';
import ColorPicker from '../components/ColorPicker';
import ProfessionalSummaryForm from '../components/ProfessionalSummaryForm';
import ExperienceForm from '../components/ExperienceForm';
import EducationForm from '../components/EducationForm';
import ProjectForm from '../components/ProjectForm';
import api from '../configs/api';
import toast from 'react-hot-toast';
import SkillsForm from '../components/SkillsForm';

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
    });
    const sections = [
        { id: 'personal', name: 'Personal Info', icon: User },
        { id: 'summary', name: 'Summary', icon: FileText },
        { id: 'experience', name: 'Experience', icon: Briefcase },
        { id: 'education', name: 'Education', icon: GraduationCap },
        { id: 'projects', name: 'Projects', icon: FolderIcon },
        { id: 'skills', name: 'Skills', icon: Sparkles },
    ];

    const activeSection = sections[activeSectionIndex]

    const completionChecks = [
        { label: 'Name, email & phone', done: !!(resumeData.personal_info?.full_name && resumeData.personal_info?.email && resumeData.personal_info?.phone) },
        { label: 'Professional summary', done: !!(resumeData.professional_summary?.trim()) },
        { label: 'At least 1 experience', done: resumeData.experience?.length > 0 },
        { label: 'At least 1 education', done: resumeData.education?.length > 0 },
        { label: 'At least 3 skills', done: resumeData.skills?.length >= 3 },
        { label: 'At least 1 project', done: resumeData.project?.length > 0 },
    ]
    const completionScore = Math.round((completionChecks.filter(c => c.done).length / completionChecks.length) * 100)

    useEffect(() => {
        if (!resumeId) return;
        const fetchResumeData = async () => {
            try {
                const { data } = await api.get('/api/resumes/get/' + resumeId)
                if (data.resume) {
                    setResumeData(data.resume);
                }
            } catch (error) {
                toast.error(error.userMessage || error.message)
            }
        }
        fetchResumeData();
    }, [resumeId]);

    const changeResumeVisibility = async () => {
        try {
            const formData = new FormData();
            formData.append('resumeId', resumeId);
            formData.append('resumeData', JSON.stringify({ public: !resumeData.public }))
            const { data } = await api.put('/api/resumes/update', formData)
            setResumeData({ ...resumeData, public: !resumeData.public })
            toast.success(data.message)
        } catch (error) {
            toast.error(error.userMessage || error.message)

        }
    }

    const saveResume = async () => {
        try {
            let updatedResumeData = structuredClone(resumeData);

            // remove image from updatedResumeData
            if (typeof resumeData.personal_info.image === 'object') {
                delete updatedResumeData.personal_info.image
            }
            const formData = new FormData();
            formData.append('resumeId', resumeId);
            formData.append('resumeData', JSON.stringify(updatedResumeData))
            removeBackground && formData.append('removeBackground', 'yes')
            typeof resumeData.personal_info.image === 'object' && formData.append('image', resumeData.personal_info.image)

            const { data } = await api.put('/api/resumes/update', formData)
            setResumeData(data.resume);
            toast.success(data.message)
        } catch (error) {
            toast.error(error.userMessage || error.message)
        }

    }

    const shareResume = () => {
        const frontendUrl = window.location.href.split('/app/')[0];
        const resumeUrl = frontendUrl + '/view/' + resumeId

        if (navigator.share) {
            navigator.share({ url: resumeUrl, text: 'My Resume', })
        } else {
            toast.error('Share not supported on this browser.')
        }
    }

    const downloadResume = () => {
        window.print();
    }

    return (
        <div>
            <Helmet><title>{resumeData.title ? `${resumeData.title} — Edit` : 'Resume Builder'} — ResuCraft</title></Helmet>
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
                                    <TemplateSelector selectedTemplate={resumeData.template} onChange={(template) => setResumeData(prev => ({ ...prev, template }))} />
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

                            {/* Completeness Indicator */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-gray-600">Resume completeness</span>
                                    <span className="text-xs font-semibold text-gray-700">{completionScore}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${completionScore}%`,
                                            background: completionScore === 100 ? '#16a34a' : completionScore >= 60 ? '#f59e0b' : '#ef4444',
                                        }}
                                    />
                                </div>
                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                                    {completionChecks.map((check) => (
                                        <span key={check.label} className={`flex items-center gap-1 text-xs ${check.done ? 'text-green-600' : 'text-gray-400'}`}>
                                            <span className="text-base leading-none">{check.done ? '✓' : '○'}</span>
                                            {check.label}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Form Content */}
                            <div className="space-y-6">
                                {activeSection.id === 'personal' && (
                                    <PersonalInfoForm data={resumeData.personal_info} onChange={(data) => setResumeData(prev => ({ ...prev, personal_info: data }))} removeBackground={removeBackground} setRemoveBackground={setRemoveBackground} />
                                )}
                                {activeSection.id === 'summary' && (
                                    <ProfessionalSummaryForm data={resumeData.professional_summary} onChange={(data) => setResumeData(prev => ({ ...prev, professional_summary: data }))} setResumeData={setResumeData} />
                                )}
                                {activeSection.id === 'experience' && (
                                    <ExperienceForm data={resumeData.experience} onChange={(data) => setResumeData(prev => ({ ...prev, experience: data }))} />
                                )}
                                {activeSection.id === 'education' && (
                                    <EducationForm data={resumeData.education} onChange={(data) => setResumeData(prev => ({ ...prev, education: data }))} />
                                )}
                                {activeSection.id === 'projects' && (
                                    <ProjectForm data={resumeData.project} onChange={(data) => setResumeData(prev => ({ ...prev, project: data }))} />
                                )}
                                {activeSection.id === 'skills' && (
                                    <SkillsForm data={resumeData.skills} onChange={(data) => setResumeData(prev => ({ ...prev, skills: data }))} />
                                )}
                            </div>
                            <button onClick={() => { toast.promise(saveResume, { loading: 'Saving' }) }} className='bg-linear-to-br from-green-100 to-green-200 ring-green-300 text-green-600 ring hover:ring-green-400 transition-all rounded-md px-6 py-2 mt-6 text-sm'>
                                Save Changes
                            </button>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="lg:col-span-7 max-lg:mt-6">
                        <div className="relative w-full">
                            {/* Buttons */}
                            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-end gap-2">
                                {resumeData.public && (
                                    <button onClick={shareResume} className='flex items-center p-2 px-4 gap-2 text-xs bg-linear-to-br from-blue-100 to-blue-200 text-blue-600 rounded-lg ring-blue-300 hover:ring transition-colors'>
                                        <Share2Icon className='size-4' /> Share
                                    </button>
                                )}
                                <button onClick={changeResumeVisibility} className='flex items-center p-2 px-4 gap-2 text-xs bg-linear-to-br from-purple-100 to-purple-200 text-purple-600 ring-purple-300 rounded-lg hover:ring transition-colors'>
                                    {resumeData.public ? <EyeIcon className='size-4' /> : <EyeOffIcon className='size-4' />}
                                    {resumeData.public ? 'Public' : 'Private'}
                                </button>

                                <button onClick={downloadResume} className="flex items-center gap-2 px-6 py-2 text-xs bg-linear-to-br from-green-100 to-green-200 text-green-600 rounded-lg ring-green-300 hover:ring transition-colors">
                                    <DownloadIcon className='size-4' /> Download
                                </button>
                            </div>
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