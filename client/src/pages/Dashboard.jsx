import { FilePenLineIcon, PlusIcon, UploadCloudIcon, TrashIcon, PencilIcon, XIcon, UploadCloud, LoaderCircleIcon, FileTextIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import api from '../configs/api'
import toast from 'react-hot-toast'
import pdfToText from 'react-pdftotext'

const Dashboard = () => {
    const colors = ['#9333ea', '#d97706', '#dc2626', '#0284c7', '#16a34a']
    const [allResumes, setAllResumes] = useState([]);
    const [showCreateResume, setShowCreateResume] = useState(false);
    const [showUploadResume, setShowUploadResume] = useState(false)
    const [title, setTitle] = useState('');
    const [resume, setResume] = useState(null);
    const [editResumeId, setEditResumeId] = useState('')
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [deleteConfirm, setDeleteConfirm] = useState(null) // { id, title }

    const fetchResumes = async () => {
        try {
            const { data } = await api.get('/api/users/resumes')
            setAllResumes(data.resumes)
        } catch (error) {
            toast.error(error.userMessage || error.message)
        } finally {
            setFetching(false)
        }
    }

    const navigate = useNavigate()

    useEffect(() => {
        fetchResumes()
    }, [])

    const createResume = async (event) => {
        event.preventDefault()
        try {

            const { data } = await api.post('/api/resumes/create', { title })
            setAllResumes([...allResumes, data.resume])
            setTitle('');
            setShowCreateResume(false);
            navigate(`/app/builder/${data.resume._id}`)
        } catch (error) {
            toast.error(error.userMessage || error.message)
        }
    }

    const uploadResume = async (event) => {
        event.preventDefault()
        setLoading(true);
        try {
            const resumeText = await pdfToText(resume)
            const { data } = await api.post('/api/ai/upload-resume', { title, resumeText })
            setTitle('');
            setResume(null)
            setShowUploadResume(false)
            setLoading(false)
            navigate(`/app/builder/${data.resumeId}`)

        } catch (error) {
            toast.error(error.userMessage || error.message)
            setLoading(false)
        }
    }

    const editTitle = async (event) => {
        event.preventDefault();
        try {
            const { data } = await api.put(`/api/resumes/update`, { resumeId: editResumeId, resumeData: { title } })
            setAllResumes(allResumes.map(resume => resume._id === editResumeId ? { ...resume, title } : resume))
            setTitle('');
            setEditResumeId('');
            toast.success(data.message)
        } catch (error) {
            toast.error(error.userMessage || error.message)
        }

    }
    const deleteResume = async () => {
        if (!deleteConfirm) return;
        try {
            const { data } = await api.delete(`/api/resumes/delete/${deleteConfirm.id}`)
            setAllResumes(allResumes.filter(resume => resume._id !== deleteConfirm.id))
            toast.success(data.message)
        } catch (error) {
            toast.error(error.userMessage || error.message)
        } finally {
            setDeleteConfirm(null)
        }
    }
    return (
        <div>
            <Helmet><title>Dashboard — ResuCraft</title></Helmet>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <p className='text-2xl font-medium mb-6 bg-linear-to-r from slate-600 to-slate-700 bg-clip-text text-transparent sm:hidden'>
                    Welcome, Joe Doe
                </p>

                <div className="flex gap-4">
                    <button onClick={() => setShowCreateResume(true)} className='w-full bg-white sm:mx-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-indigo-500 hover:shadow-lg transition-all duration-300 cursor-pointer'>
                        <PlusIcon className='size-11 transition-all duration-300 p-2.5 bg-linear-to-br from-indigo-300 to-indigo-500 text-white rounded-full' />
                        <p className='text-sm group-hover:text-indigo-600 transition-all duration-300'>
                            Create Resume
                        </p>
                    </button>
                    <button onClick={() => setShowUploadResume(true)} className='w-full bg-white sm:mx-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-purple-500 hover:shadow-lg transition-all duration-300 cursor-pointer'>
                        <UploadCloudIcon className='size-11 transition-all duration-300 p-2.5 bg-linear-to-br from-purple-300 to-purple-500 text-white rounded-full' />
                        <p className='text-sm group-hover:text-purple-600 transition-all duration-300'>
                            Upload Existing Resume
                        </p>
                    </button>
                </div>

                <hr className='border-slate-300 my-6 sm:w-305px' />

                {fetching ? (
                    <div className="flex items-center justify-center py-24">
                        <LoaderCircleIcon className='animate-spin size-8 text-slate-300' />
                    </div>
                ) : allResumes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 max-w-md w-full">
                            <div className="flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-full mx-auto mb-5">
                                <FileTextIcon className='size-8 text-indigo-400' />
                            </div>
                            <h2 className="text-xl font-semibold text-slate-800 mb-2">No resumes yet</h2>
                            <p className="text-slate-500 text-sm mb-8">
                                Create your first resume in minutes — with AI that writes for you.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={() => setShowCreateResume(true)}
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    <PlusIcon className='size-4' /> Create from scratch
                                </button>
                                <button
                                    onClick={() => setShowUploadResume(true)}
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg border border-slate-300 transition-colors"
                                >
                                    <UploadCloudIcon className='size-4' /> Upload existing resume
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:flex flex-wrap gap-4">
                        {allResumes.map((resume, index) => {
                            const baseColor = colors[index % colors.length];
                            return (
                                <button key={index} onClick={() => navigate(`/app/builder/${resume._id}`)} className='relative w-full sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 border group hover:shadow-lg transition-all duration-300 cursor-pointer' style={{ background: `linear-gradient(135deg,${baseColor}10,${baseColor}40)`, borderColor: baseColor + '40' }}>
                                    <FilePenLineIcon className='size-7 group-hover:scale-105 transition-all' style={{ color: baseColor }} />
                                    <p className="text-sm group-hover:scale-105 transition-all px-2 text" style={{ color: baseColor }}>
                                        {resume.title}
                                    </p>
                                    <p className='absolute bottom-1 text-11px text-slate-400 group-hover:text-slate-500 transition-all duration-300 px-2 text-center' style={{ color: baseColor + '90' }}>
                                        Updated on {new Date(resume.updatedAt).toLocaleDateString()}
                                    </p>
                                    <div onClick={(e) => e.stopPropagation()} className='absolute top-1 right-1 group-hover:flex items-center hidden'>
                                        <TrashIcon onClick={() => setDeleteConfirm({ id: resume._id, title: resume.title })} className='size-7 p-1.5 hover:bg-white/50 rounded text-slate-700 transition-color' />
                                        <PencilIcon onClick={() => { setEditResumeId(resume._id); setTitle(resume.title) }} className='size-7 p-1.5 hover:bg-white/50 rounded text-slate-700 transition-color' />
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                )}

                {showCreateResume && (
                    <form onSubmit={createResume} onClick={() => setShowCreateResume(false)} className="fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-10 flex items-center justify-center">
                        <div onClick={e => e.stopPropagation()} className='relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6'>
                            <h2 className='text-xl font-bold mb-4'>Create a Resume</h2>
                            <input onChange={(e) => { setTitle(e.target.value) }} value={title} type='text' placeholder='Enter resume title' className='w-full px-4 py-2 mb-4 focus:border-green-600 ring-green-600' required />
                            <button className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">Create Resume</button>
                            <XIcon className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors' onClick={() => { setShowCreateResume(false); setTitle('') }} />
                        </div>
                    </form>
                )}

                {showUploadResume && (
                    <form onSubmit={uploadResume} onClick={() => setShowUploadResume(false)} className="fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-10 flex items-center justify-center">
                        <div onClick={e => e.stopPropagation()} className='relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6'>
                            <h2 className='text-xl font-bold mb-4'>Upload Resume</h2>
                            <input onChange={(e) => { setTitle(e.target.value) }} value={title} type='text' placeholder='Enter resume title' className='w-full px-4 py-2 mb-4 focus:border-green-600 ring-green-600' required />
                            <div className="">
                                <label htmlFor="resume-input" className='block text-sm text-slate-700'>
                                    Select resume file
                                    <div className="flex flex-col items-center justify-center gap-2 border group text-slate-400 border-slate-400 border-dashed rounded-md p-4 my-4 hover:border-green-500 hover:text-green-700 cursor-pointer transition-colors">
                                        {resume ? (
                                            <p className="text-green-700">{resume.name}</p>
                                        ) : (
                                            <>
                                                <UploadCloud className="size-14 stroke-1" />
                                                <p>Upload Resume</p>
                                            </>
                                        )}
                                    </div>
                                </label>
                                <input type="file" id='resume-input' accept='.pdf' hidden onChange={(e) => { setResume(e.target.files[0]) }} />
                            </div>
                            <button className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-2" disabled={loading}>
                                {loading && <LoaderCircleIcon className='animate-spin size-4 text-white' />}
                                {loading ? 'Uploading' : 'Upload Resume'}
                            </button>
                            <XIcon className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors' onClick={() => { setShowUploadResume(false); setTitle('') }} />
                        </div>
                    </form>
                )}

                {deleteConfirm && (
                    <div onClick={() => setDeleteConfirm(null)} className="fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-10 flex items-center justify-center">
                        <div onClick={e => e.stopPropagation()} className='relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6'>
                            <h2 className='text-xl font-bold mb-2'>Delete Resume</h2>
                            <p className='text-slate-600 text-sm mb-6'>Are you sure you want to delete <span className='font-semibold text-slate-800'>"{deleteConfirm.title}"</span>? This cannot be undone.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 bg-white border border-slate-300 text-slate-700 text-sm rounded hover:bg-slate-50 transition-colors">Cancel</button>
                                <button onClick={deleteResume} className="flex-1 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors">Delete</button>
                            </div>
                            <XIcon className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors' onClick={() => setDeleteConfirm(null)} />
                        </div>
                    </div>
                )}

                {editResumeId && (
                    <form onSubmit={editTitle} onClick={() => setEditResumeId('')} className="fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-10 flex items-center justify-center">
                        <div onClick={e => e.stopPropagation()} className='relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6'>
                            <h2 className='text-xl font-bold mb-4'>Edit Resume</h2>
                            <input onChange={(e) => { setTitle(e.target.value) }} value={title} type='text' placeholder='Enter resume title' className='w-full px-4 py-2 mb-4 focus:border-green-600 ring-green-600' required />
                            <button className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">Update</button>
                            <XIcon className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors' onClick={() => { setEditResumeId(''); setTitle('') }} />
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

export default Dashboard