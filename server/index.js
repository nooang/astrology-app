const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

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
    const { birthDate, birthTime, birthPlace, gender, fortuneType, tone, customQuestion } = date;
    const today = new Date().toLocaleDateString();

    let prompt = `너는 20년 경력의 전문 점술가야.
다음 사용자 정보와 ${today}의 날짜를 바탕으로 2분 안으로 읽을 수 있는 간단 요약 운세를 알려줘.

[사용자 정보]
- 생년월일: ${birthDate}
- 성별: ${gender === 'male' ? '남성' : gender === 'female' ? '여성' : '기타'}
${birthTime ? `- 태어난 시간: ${birthTime}` : ''}
${birthPlace ? `- 태어난 장소: ${birthPlace}` : ''}
- 운세 종류: ${fortuneType === 'newYear' ? '2026년 신년 운세' : fortuneType}
`;

    // Include custom question if provided
    if (customQuestion && customQuestion.trim() !== '') {
        prompt += `- 추가 질문/요청: ${customQuestion}\n`;
    }

    prompt += `
[답변 지침]
- 결과는 **Markdown** 형식을 적극 활용하여 가독성 있게 작성한다 (## 제목, **강조**, > 인용구 등).
- 점성술적인 관점에서 구체적인 조언을 제공한다.
- 마지막 한 번 더 요약해준다.
${tone === "" ? "" : `- **${tone}**인 관점에서 예언한다.`}`;

    return prompt;
}

app.get('/', (req, res) => {
    res.send('Astrology App Server is running');
});
// 모델들: gemini-2.5-flash-lite, gemini-2.5-flash, gemini-3-flash-preview, gemini-3-pro-preview
app.post('/api/fortune', async (req, res) => {
    try {
        const userData = req.body;
        const prompt = generatePrompt(userData);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
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