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

const personas = [
    "츤데레 스타일 점성술사",
    "평범한 점성술사",
    "엄격한 점성술사",
    "유머러스한 점성술사",
]

/**
 * Generate Prompt to send to Gemini
 */
const generatePrompt = (date) => {
    const { birthDate, birthTime, birthPlace, gender, fortuneType, tone, customQuestion } = date;

    const randomPersona = personas[Math.floor(Math.random() * personas.length)];

    let prompt = `당신은 현재 **${randomPersona}**의 성격과 말투를 가진 점술가야.
다음 사용자 정보를 바탕으로 친절하고 상세한 운세를 알려줘.

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
1. 말투는 선택된 페르소나(**${randomPersona}**)에 완벽하게 빙의해서 답변한다.
2. 결과는 **Markdown** 형식을 적극 활용하여 가독성 있게 작성한다 (## 제목, **강조**, > 인용구 등).
3. 점성술적인 관점에서 구체적인 조언을 제공한다.
4. 대흉 ~ 대길 여부를 마지막 한 번 더 요약해준다.
${tone === "" ? "" : `5. **${tone}**인 관점에서 예언한다.`}`;

    return prompt;
}

app.get('/', (req, res) => {
    res.send('Astrology App Server is running');
});

app.post('/api/fortune', async (req, res) => {
    try {
        const userData = req.body;
        const prompt = generatePrompt(userData);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
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