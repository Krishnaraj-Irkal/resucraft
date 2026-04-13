import ai from "../config/ai.js";
import Resume from "../models/Resume.js";

// controller for enhancing a resume's professional summary
// POST: /api/ai/enhance-pro-sum

export const enhanceProfessionalSummary = async (req, res) => {
    try {
        const { userContent } = req.body

        const response = await ai.models.generateContent({
            model: process.env.GEMINI_MODEL,
            systemInstruction: 'You are an expert in resume writing. Your task is to enhance the professional summary of a resume. The summary should be 1-2 sentences also highlighting key skills experience, and career objectives. Make it compelling and ATS-friendly and only return text no options or anything else.',
            contents: [{ role: 'user', parts: [{ text: userContent }] }],
        });

        const enhancedContent = response.text;
        return res.status(200).json({ enhancedContent })
    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong. Please try again.' })
    }
}

// controller for enhancing a resume's job description
// POST: /api/ai/enhance-job-desc

export const enhanceJobDescription = async (req, res) => {
    try {
        const { userContent } = req.body

        const response = await ai.models.generateContent({
            model: process.env.GEMINI_MODEL,
            systemInstruction: 'You are an expert in resume writing. Your task is to enhance the job description of a resume. The job description should be only in 1-2 sentences also highlighting key responsibilities and achievements. Use action verbs and quantifiable results where possible. Make it ATS-friendly and only return text no options or anything else',
            contents: [{ role: 'user', parts: [{ text: userContent }] }],
        });

        const enhancedContent = response.text;
        return res.status(200).json({ enhancedContent })
    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong. Please try again.' })
    }
}


// controller for enhancing a resume to the database
// POST: /api/ai/upload-resume

export const uploadResume = async (req, res) => {
    try {
        const { resumeText,title } = req.body;
        const userId = req.userId;

        const userPrompt = `Extract data from this resume: ${resumeText}.
        Provide data in the following JSON format with no additional text before or after:
        {
            professional_summary:{type:String, default:''},
            skills:[{type:String }],
            personal_info:{
                image:{type:String, default:''},
                full_name:{type:String, default:''},
                profession:{type:String, default:''},
                email:{type:String, default:''},
                phone:{type:String, default:''},
                location:{type:String, default:''},
                linkedin:{type:String, default:''},
                website:{type:String, default:''},
                github:{type:String, default:''}
            },
            experience: [{
                company:{type:String},
                position:{type:String},
                start_date:{type:String},
                end_date:{type:String},
                description:{type:String},
                is_current:{type:Boolean}
            }],
            project:[{
                name:{type:String},
                type:{type:String},
                description:{type:String},
            }],
            education: [{
                institution:{type:String},
                degree:{type:String},
                field:{type:String},
                graduation_date:{type:String},
                gpa:{type:String}
            }]
        }
        `;

        const response = await ai.models.generateContent({
            model: process.env.GEMINI_MODEL,
            systemInstruction: "You are an expert AI Agent to extract data from resume. Return only valid JSON.",
            contents: userPrompt,
            generationConfig: { responseMimeType: 'application/json' }
        });
        const extractedData = JSON.parse(response.candidates[0].content.parts[0].text);

        const newResume = await Resume.create({ userId, title, ...extractedData })

        return res.status(200).json({ resumeId: newResume._id });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
