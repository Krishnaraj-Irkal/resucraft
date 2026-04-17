import { useState, useRef } from 'react'
import { Plus, Sparkles, X } from 'lucide-react'

const SUGGESTIONS = {
    Technical: [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin',
        'React', 'Next.js', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Django', 'FastAPI', 'Spring Boot',
        'HTML', 'CSS', 'Tailwind CSS', 'GraphQL', 'REST APIs', 'SQL', 'PostgreSQL', 'MongoDB', 'Redis',
        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'Linux',
    ],
    'Soft Skills': [
        'Leadership', 'Communication', 'Teamwork', 'Problem Solving', 'Critical Thinking',
        'Time Management', 'Adaptability', 'Creativity', 'Attention to Detail', 'Project Management',
        'Mentoring', 'Public Speaking', 'Conflict Resolution', 'Decision Making',
    ],
    'Tools & Platforms': [
        'VS Code', 'Figma', 'Jira', 'Confluence', 'Slack', 'GitHub', 'GitLab', 'Bitbucket',
        'Postman', 'Webpack', 'Vite', 'Jest', 'Cypress', 'Storybook', 'Notion', 'Linear',
    ],
}

const ALL_SUGGESTIONS = Object.values(SUGGESTIONS).flat()

const CATEGORY_COLORS = {
    Technical: 'bg-blue-100 text-blue-800 ring-blue-200',
    'Soft Skills': 'bg-green-100 text-green-800 ring-green-200',
    'Tools & Platforms': 'bg-purple-100 text-purple-800 ring-purple-200',
    Other: 'bg-gray-100 text-gray-800 ring-gray-200',
}

const getCategory = (skill) => {
    for (const [cat, list] of Object.entries(SUGGESTIONS)) {
        if (list.map(s => s.toLowerCase()).includes(skill.toLowerCase())) return cat
    }
    return 'Other'
}

const SkillsForm = ({ data, onChange }) => {
    const [input, setInput] = useState('')
    const [activeCategory, setActiveCategory] = useState('All')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const inputRef = useRef(null)

    const filtered = input.trim().length > 0
        ? ALL_SUGGESTIONS.filter(s =>
            s.toLowerCase().includes(input.toLowerCase()) && !data.includes(s)
          ).slice(0, 8)
        : []

    const addSkill = (skill) => {
        const trimmed = skill.trim()
        if (trimmed && !data.map(s => s.toLowerCase()).includes(trimmed.toLowerCase())) {
            onChange([...data, trimmed])
        }
        setInput('')
        setShowSuggestions(false)
        inputRef.current?.focus()
    }

    const removeSkill = (index) => onChange(data.filter((_, i) => i !== index))

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); if (input.trim()) addSkill(input) }
        if (e.key === 'Escape') setShowSuggestions(false)
    }

    const categories = ['All', ...Object.keys(SUGGESTIONS)]
    const displayedSkills = activeCategory === 'All'
        ? data
        : data.filter(s => getCategory(s) === activeCategory)

    const quickSuggestions = activeCategory === 'All'
        ? ALL_SUGGESTIONS.filter(s => !data.includes(s)).slice(0, 12)
        : SUGGESTIONS[activeCategory]?.filter(s => !data.includes(s)).slice(0, 12) ?? []

    return (
        <div className='space-y-5'>
            <div>
                <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'>Skills</h3>
                <p className='text-sm text-gray-500'>Add your technical and soft skills</p>
            </div>

            {/* Input with typeahead */}
            <div className="relative">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder='Type a skill and press Enter…'
                            className='w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300'
                            value={input}
                            onChange={(e) => { setInput(e.target.value); setShowSuggestions(true) }}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        />
                        {showSuggestions && filtered.length > 0 && (
                            <ul className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {filtered.map(s => (
                                    <li
                                        key={s}
                                        onMouseDown={() => addSkill(s)}
                                        className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 flex items-center justify-between"
                                    >
                                        {s}
                                        <span className="text-xs text-gray-400">{getCategory(s)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <button
                        onClick={() => { if (input.trim()) addSkill(input) }}
                        disabled={!input.trim()}
                        className="flex items-center gap-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="size-4" /> Add
                    </button>
                </div>
            </div>

            {/* Quick suggestions */}
            {quickSuggestions.length > 0 && (
                <div>
                    <p className='text-xs text-gray-500 mb-2'>Quick add:</p>
                    <div className="flex flex-wrap gap-1.5">
                        {quickSuggestions.map(s => (
                            <button
                                key={s}
                                onClick={() => addSkill(s)}
                                className="px-2.5 py-1 text-xs border border-dashed border-gray-300 rounded-full text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                                + {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Category filter tabs */}
            {data.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-3 py-1 text-xs rounded-full transition-colors ${activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {cat}
                            {cat === 'All'
                                ? ` (${data.length})`
                                : ` (${data.filter(s => getCategory(s) === cat).length})`
                            }
                        </button>
                    ))}
                </div>
            )}

            {/* Skill chips */}
            {data.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {displayedSkills.map((skill) => {
                        const cat = getCategory(skill)
                        return (
                            <span
                                key={skill}
                                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ring-1 ${CATEGORY_COLORS[cat]}`}
                            >
                                {skill}
                                <button
                                    onClick={() => removeSkill(data.indexOf(skill))}
                                    className='ml-0.5 hover:opacity-70 rounded-full transition-opacity'
                                >
                                    <X className='w-3 h-3' />
                                </button>
                            </span>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-6 text-gray-500">
                    <Sparkles className='w-10 h-10 mx-auto mb-2 text-gray-300' />
                    <p>No skills added yet.</p>
                    <p className='text-sm'>Type above or click a quick-add suggestion.</p>
                </div>
            )}

            <div className="bg-blue-50 p-3 rounded-lg">
                <p className='text-sm text-blue-800'><strong>Tip: </strong>Add 8–12 relevant skills. Mix technical skills, tools, and soft skills for a well-rounded profile.</p>
            </div>
        </div>
    )
}

export default SkillsForm
