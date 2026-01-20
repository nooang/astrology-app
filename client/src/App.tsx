import { useState, type ChangeEvent, type FormEvent } from "react";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import "./App.css";

// type definitions
interface UserInfo {
  birthDate: string;
  birthTime?: string;
  birthPlace?: string;
  gender: 'male' | 'female' | 'other';
  fortuneType: string;
  tone: string;
  customQuestion: string;
}

interface FortuneResponse {
  fortune: string;
}

interface FortuneItem {
  id: number;
  type: string;
  content: string;
}

function App() {
  // state management
  const [userInfo, setUserInfo] = useState<UserInfo>({
    birthDate: '1900-01-01',
    gender: 'male',
    fortuneType: '2026년 신년 운세',
    tone: '중립적',
    customQuestion: ''
  });

  const [results, setResults] = useState<FortuneItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // input change handler
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({...prev, [name]: value }));
  };

  // server communication handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInfo.birthDate) {
      alert('생년월일을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post<FortuneResponse>('/api/fortune', userInfo);
      const newFortune: FortuneItem = {
        id: results.length + 1,
        type: userInfo.fortuneType,
        content: response.data.fortune
      }
      setResults(prev => [...prev, newFortune]);
      setActiveIndex(results.length); // 가장 최근 운세를 활성화
    } catch (error) {
      console.error("Error fetching fortune:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <h2>🔮 밤하늘에게 물어봐! 🔮</h2>
      <div className="main-layout">
        {/* 왼쪽: 입력 창 */}
        <section className="input-panel">
          
          <form className="fortune-form" onSubmit={handleSubmit}>
            <div className="field">
              <label>생년월일</label><br/>
              <input type="text" name="birthDate" onChange={handleChange} placeholder="1999-12-31" required />
            </div>
            <div className="field">
              <label>성별</label><br/>
              <select name="gender" onChange={handleChange}>
                <option value="male">남성</option>
                <option value="female">여성</option>
                <option value="other">기타/비공개</option>
              </select>
            </div>
            <div className="field">
              <label>태어난 시간</label><br/>
              <input type="time" name="birthTime" onChange={handleChange} />
            </div>
            <div className="field">
              <label>태어난 장소</label><br/>
              <input type="text" name="birthPlace" onChange={handleChange} />
            </div>
            <div className="field">
              <label>운세의 분위기</label><br/>
              <select name="tone" onChange={handleChange}>
                <option value="">선택 안 함</option>
                <option value="중립적">중립적</option>
                <option value="낙관적">낙관적 (희망찬)</option>
                <option value="염세적">염세적 (비관적/경고)</option>
              </select>
            </div>
            <div className="field">
              <label>운세 종류</label><br/>
              <select name="fortuneType" onChange={handleChange}>
                <option value="신년 운세">신년 운세</option>
                <option value="연애운">연애운</option>
                <option value="재물운">재물운</option>
                <option value="직장운/학업운">직장운/학업운</option>
                <option value="직접 입력">직접 입력 (아래 작성)</option>
              </select>
            </div>
            <textarea name="customQuestion" placeholder="추가 질문을 입력하세요..." onChange={handleChange} />
            <button type="submit" disabled={isLoading}>{isLoading ? '운세를 보고 있습니다...' : '운세 생성'}</button>
          </form>
        </section>

        {/* 오른쪽: 결과 창 */}
        <section className="result-panel">
          <div className="tabs">
            {results.map((item, index) => (
              <button 
                key={item.id} 
                className={activeIndex === index ? 'active-tab' : ''}
                onClick={() => setActiveIndex(index)}
              >
                결과 {item.id}
              </button>
            ))}
          </div>

          <div className="display-area">
            {activeIndex !== null ? (
              <div key={activeIndex} className="markdown-content animate-reveal">
                <ReactMarkdown>{results[activeIndex].content}</ReactMarkdown>
              </div>
            ) : (
              <div className="empty-msg">왼쪽에서 정보를 입력하고 운세를 확인하세요.</div>
            )}
          </div>
        </section>
      </div>
    </>
  )
}

export default App
