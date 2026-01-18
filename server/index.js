const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenAI, ThinkingLevel } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Gemini API
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());

/**
 * Generate Prompt to send to Gemini
 */
const generatePrompt = (date) => {
    const { birthDate, gender, fortuneType, customQuestion } = date;

    let prompt = `너는 신비롭고 통찰있는 20년 경력의 전문 점성술사야.
다음 사용자 정보를 바탕으로 친절하고 상세한 운세를 알려줘.

[사용자 정보]
- 생년월일: ${birthDate}
- 성별: ${gender === 'male' ? '남성' : gender === 'female' ? '여성' : '기타'}
- 운세 종류: ${fortuneType === 'newYear' ? '2026년 신년 운세' : fortuneType}
`;

    // Include custom question if provided
    if (customQuestion && customQuestion.trim() !== '') {
        prompt += `- 추가 질문/요청: ${customQuestion}\n`;
    }

    prompt += `
[답변 지침]
1. 점성술적인 관점에서 구체적인 조언을 제공할 것.`;

    return prompt;
}

app.get('/', (req, res) => {
    res.send('Astrology App Server is running');
});

app.post('/api/fortune', (req, res) => {
    try {
        const userData = req.body;
        const prompt = generatePrompt(userData);
        const response = ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                thinkingConfig: {
                    thinkingLevel: ThinkingLevel.LOW,
                },
            }
        });
        const text = response.text;
        console.log('Gemini Response:', text);

        res.json({ fortune: text });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({
            error: 'Failed to generate fortune',
            details: error.message
        });
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})