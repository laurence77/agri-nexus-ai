import React, { useState } from 'react';
import { ProvenanceViewer } from '@/components/ui/provenance-viewer';

interface TrainingModule {
  id: string;
  title: string;
  type: 'video' | 'audio' | 'quiz' | 'voice';
  url?: string;
  questions?: QuizQuestion[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer: string;
}

interface TrainingProgress {
  moduleId: string;
  completed: boolean;
  score?: number;
}

const demoModules: TrainingModule[] = [
  { id: 'm1', title: 'Intro to Digital Literacy', type: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  { id: 'm2', title: 'Safe Agrochemical Use', type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'm3', title: 'Basic Agronomy Quiz', type: 'quiz', questions: [
    { id: 'q1', question: 'What is no-till farming?', options: ['A planting method', 'A fertilizer', 'A pest'], answer: 'A planting method' },
    { id: 'q2', question: 'Why use cover crops?', options: ['Soil health', 'Pest control', 'Both'], answer: 'Both' }
  ] },
  { id: 'm4', title: 'Leave a Voice Note', type: 'voice' }
];

export default function TrainingDashboard() {
  const [progress, setProgress] = useState<TrainingProgress[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState('');

  const markComplete = async (moduleId: string, score?: number) => {
    setProgress(p => {
      const exists = p.find(pr => pr.moduleId === moduleId);
      if (exists) return p.map(pr => pr.moduleId === moduleId ? { ...pr, completed: true, score } : pr);
      return [...p, { moduleId, completed: true, score }];
    });
    setMsg('Module marked complete!');
    // Provenance patch
    try {
      // Try to get user email from localStorage or context (customize as needed)
      const userEmail = localStorage.getItem('user_email') || 'unknown';
      const { ProvenanceService } = await import('@/lib/provenance');
      await ProvenanceService.recordRecordChanges('training_progress', moduleId, {
        completed: { newValue: true },
        ...(typeof score === 'number' ? { score: { newValue: score } } : {})
      }, {
        source: 'user',
        entered_by: userEmail,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to record provenance for training progress:', err);
    }
  };

  const handleQuizSubmit = (module: TrainingModule) => {
    let score = 0;
    module.questions?.forEach(q => {
      if (quizAnswers[q.id] === q.answer) score++;
    });
    markComplete(module.id, score);
    setMsg(`Quiz complete! Score: ${score}/${module.questions?.length}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Knowledge & Training Center</h1>
      {demoModules.map(module => (
        <div key={module.id} className="mb-6 p-4 border rounded bg-white">
          <h2 className="font-semibold text-lg mb-2">{module.title}</h2>
          {module.type === 'video' && module.url && (
            <div className="mb-2">
              <iframe width="100%" height="250" src={module.url} title={module.title} allowFullScreen />
              <button className="mt-2 bg-green-600 text-white px-3 py-1 rounded" onClick={() => markComplete(module.id)}>Mark Complete</button>
            </div>
          )}
          {module.type === 'audio' && module.url && (
            <div className="mb-2">
              <audio controls src={module.url} />
              <button className="mt-2 bg-green-600 text-white px-3 py-1 rounded" onClick={() => markComplete(module.id)}>Mark Complete</button>
            </div>
          )}
          {module.type === 'quiz' && module.questions && (
            <form onSubmit={e => { e.preventDefault(); handleQuizSubmit(module); }}>
              {module.questions.map(q => (
                <div key={q.id} className="mb-2">
                  <label className="block font-medium mb-1">{q.question}</label>
                  {q.options.map(opt => (
                    <label key={opt} className="block">
                      <input type="radio" name={q.id} value={opt} checked={quizAnswers[q.id] === opt} onChange={() => setQuizAnswers(a => ({ ...a, [q.id]: opt }))} /> {opt}
                    </label>
                  ))}
                </div>
              ))}
              <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Submit Quiz</button>
            </form>
          )}
          {module.type === 'voice' && (
            <div>
              <p className="mb-2">(Voice note feature coming soon)</p>
              <button className="bg-gray-400 text-white px-3 py-1 rounded opacity-50 cursor-not-allowed" disabled>Record</button>
            </div>
          )}
          <div className="mt-2 text-xs">
            {progress.find(p => p.moduleId === module.id)?.completed ? <span className="text-green-700">Completed</span> : <span className="text-gray-500">Not completed</span>}
            {typeof progress.find(p => p.moduleId === module.id)?.score === 'number' && (
              <span className="ml-2">Score: {progress.find(p => p.moduleId === module.id)?.score}</span>
            )}
          </div>
        </div>
      ))}
      {msg && <div className="p-2 bg-green-100 border-green-400 border rounded mb-4">{msg}</div>}
    {/* Data Provenance Section */}
    <div className="max-w-3xl mx-auto mt-12">
      <ProvenanceViewer
        tableName="training_progress"
        recordId={typeof window !== 'undefined' ? (localStorage.getItem('user_email') || 'demo-user') : 'demo-user'}
        showValue={true}
      />
    </div>
  </div>
  );
}
