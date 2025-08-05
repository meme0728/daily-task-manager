// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App


// ラベル削除
const deleteLabel = (labelToDelete) => {
  setLabels(labels.filter(label => label !== labelToDelete));
};import React, { useState, useEffect, useRef } from 'react';
import { Plus, Settings, Download, Moon, Sun, Copy } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const DailyTaskManager = () => {
const [darkMode, setDarkMode] = useState(false);
const [tasks, setTasks] = useState([]);
const [taskInput, setTaskInput] = useState('');
const [currentTime, setCurrentTime] = useState(new Date());
const [showSettings, setShowSettings] = useState(false);
const [labels, setLabels] = useState(['仕事', '勉強', '休憩', 'ミーティング', '個人時間', '会議']);
const [newLabel, setNewLabel] = useState('');
const [autoLabelRules, setAutoLabelRules] = useState([
  { keywords: ['打合せ', '定例', 'MTG', 'GMT', 'UMT'], label: '会議', enabled: true }
]);
const [newRuleKeywords, setNewRuleKeywords] = useState('');
const [newRuleLabel, setNewRuleLabel] = useState('');

// 現在時刻を1秒ごとに更新
useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTime(new Date());
  }, 1000);
  return () => clearInterval(timer);
}, []);
const [upperHeight, setUpperHeight] = useState(50); // 上部の高さ（パーセンテージ）
const isDragging = useRef(false);

// タイムスケジュール（15分刻み、9:00-19:00）
const [schedule, setSchedule] = useState(() => {
  const times = [];
  for (let hour = 9; hour < 19; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      times.push({
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        plan: '',
        actual: '',
        label: ''
      });
    }
  }
  return times;
});

// ドラッグ&ドロップでリサイズ機能
const handleMouseDown = (e) => {
  isDragging.current = true;
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  e.preventDefault();
};

const handleMouseMove = (e) => {
  if (!isDragging.current) return;
  
  const windowHeight = window.innerHeight - 100; // ヘッダーの高さを考慮
  const mouseY = e.clientY - 100; // ヘッダーの高さを差し引く
  const percentage = Math.max(20, Math.min(80, (mouseY / windowHeight) * 100));
  setUpperHeight(percentage);
};

const handleMouseUp = () => {
  isDragging.current = false;
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
};

// 時間帯の色を取得
const getTimeZoneColor = (time) => {
  const hour = parseInt(time.split(':')[0]);
  if (hour >= 9 && hour < 12) {
    return darkMode ? 'bg-green-900/30' : 'bg-green-50'; // 集中ゾーン
  } else if (hour >= 13 && hour < 16) {
    return darkMode ? 'bg-blue-900/30' : 'bg-blue-50'; // 作業ゾーン
  } else if (hour >= 16 && hour < 17) {
    return darkMode ? 'bg-orange-900/30' : 'bg-orange-50'; // スパートゾーン
  }
  return darkMode ? 'bg-gray-800' : 'bg-white';
};

// 1時間の区切りを判定
const isHourBoundary = (time) => {
  return time.endsWith(':00');
};

// タスク追加
const addTask = () => {
  if (taskInput.trim()) {
    setTasks([...tasks, { id: Date.now(), text: taskInput.trim(), completed: false, flagged: false }]);
    setTaskInput('');
  }
};

// タスク完了切り替え
const toggleTask = (id) => {
  setTasks(tasks.map(task => 
    task.id === id ? { ...task, completed: !task.completed } : task
  ));
};

// タスクフラグ切り替え
const toggleTaskFlag = (id) => {
  setTasks(tasks.map(task => 
    task.id === id ? { ...task, flagged: !task.flagged } : task
  ));
};

// タスク削除
const deleteTask = (id) => {
  setTasks(tasks.filter(task => task.id !== id));
};

// 自動ラベル判定
const getAutoLabel = (text) => {
  if (!text) return '';
  
  for (const rule of autoLabelRules) {
    if (rule.enabled && rule.keywords.some(keyword => text.endsWith(keyword))) {
      return rule.label;
    }
  }
  return '';
};

// スケジュール更新（自動ラベル判定付き）
const updateSchedule = (index, field, value) => {
  const newSchedule = [...schedule];
  newSchedule[index][field] = value;
  
  // 実績が更新された場合、自動ラベル判定を実行
  if (field === 'actual' && value && !newSchedule[index].label) {
    const autoLabel = getAutoLabel(value);
    if (autoLabel) {
      newSchedule[index].label = autoLabel;
    }
  }
  
  setSchedule(newSchedule);
};

// ラベル追加
const addLabel = () => {
  if (newLabel.trim() && !labels.includes(newLabel.trim())) {
    setLabels([...labels, newLabel.trim()]);
    setNewLabel('');
  }
};

// 自動判定ルール追加
const addAutoLabelRule = () => {
  if (newRuleKeywords.trim() && newRuleLabel.trim()) {
    const keywords = newRuleKeywords.split(',').map(k => k.trim()).filter(k => k);
    setAutoLabelRules([...autoLabelRules, { keywords, label: newRuleLabel.trim(), enabled: true }]);
    setNewRuleKeywords('');
    setNewRuleLabel('');
  }
};

// 自動判定ルール削除
const deleteAutoLabelRule = (index) => {
  setAutoLabelRules(autoLabelRules.filter((_, i) => i !== index));
};

// 自動判定ルールの有効/無効切り替え
const toggleAutoLabelRule = (index) => {
  const newRules = [...autoLabelRules];
  newRules[index].enabled = !newRules[index].enabled;
  setAutoLabelRules(newRules);
};

// 実績データ集計（2レベル）
const getActualData = () => {
  const labelData = {};
  schedule.forEach(slot => {
    if (slot.actual && slot.label) {
      if (!labelData[slot.label]) {
        labelData[slot.label] = {};
      }
      if (!labelData[slot.label][slot.actual]) {
        labelData[slot.label][slot.actual] = 0;
      }
      labelData[slot.label][slot.actual] += 0.25; // 15分 = 0.25時間
    }
  });
  
  const result = [];
  let colorIndex = 0;
  
  Object.entries(labelData).forEach(([label, tasks]) => {
    const labelTotal = Object.values(tasks).reduce((sum, hours) => sum + hours, 0);
    const labelColor = beautifulColors[colorIndex % beautifulColors.length];
    
    // 外側の円用データ
    result.push({
      name: label,
      value: labelTotal,
      fill: labelColor,
      isLabel: true
    });
    
    // 内側の円用データ
    Object.entries(tasks).forEach(([task, hours]) => {
      result.push({
        name: task,
        value: hours,
        fill: labelColor,
        opacity: 0.6,
        parent: label,
        isTask: true
      });
    });
    
    colorIndex++;
  });
  
  return result;
};

// CSV エクスポート
const exportToCSV = () => {
  const csvContent = [
    ['時間', '計画', '実績', 'ラベル'],
    ...schedule.map(slot => [slot.time, slot.plan, slot.actual, slot.label])
  ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `daily_schedule_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

// コピー機能
const copySchedule = async () => {
  const scheduleText = schedule.map(slot => 
    `${slot.time}\t${slot.plan}\t${slot.actual}\t${slot.label}`
  ).join('\n');
  
  try {
    await navigator.clipboard.writeText(scheduleText);
    alert('スケジュールをコピーしました');
  } catch (err) {
    // Clipboard APIが使用できない場合のフォールバック
    const textArea = document.createElement('textarea');
    textArea.value = scheduleText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('スケジュールをコピーしました');
  }
};

// 美しい配色パレット
const beautifulColors = [
  '#FF6B6B', // 鮮やかな赤
  '#4ECDC4', // ターコイズ
  '#45B7D1', // 空色
  '#96CEB4', // ミントグリーン
  '#FFEAA7', // 暖かい黄色
  '#DDA0DD', // プラム
  '#98D8C8', // 淡いティール
  '#FFB6C1', // ライトピンク
  '#87CEEB', // スカイブルー
  '#F7DC6F'  // 淡い金色
];

return (
  <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
    {/* ヘッダー */}
    <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Daily Task Manager</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowSettings(true)}
            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <Settings size={20} />
          </button>
          <button
            onClick={exportToCSV}
            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <Download size={20} />
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </header>

    <div className="flex flex-col h-screen">
      {/* 最上部：2つのカードパネル */}
      <div className={`flex space-x-4 p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        {/* タスク完了状況カード */}
        <div className={`flex-1 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className="text-sm font-medium mb-2">タスク完了状況</h3>
          <div className="flex items-center space-x-4">
            <div className="w-24 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: '完了', value: tasks.filter(t => t.completed).length },
                      { name: '未完了', value: tasks.filter(t => !t.completed).length }
                    ]}
                    cx="50%"
                    cy="100%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={20}
                    outerRadius={40}
                    dataKey="value"
                  >
                    <Cell fill="#10B981" />
                    <Cell fill={darkMode ? '#374151' : '#E5E7EB'} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-sm">
              <div className="font-semibold text-lg">
                {tasks.filter(t => t.completed).length}/{tasks.length}
              </div>
              <div className="text-xs opacity-70">完了済み</div>
            </div>
          </div>
        </div>

        {/* 現在時刻タスクカード */}
        <div className={`flex-1 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className="text-sm font-medium mb-2">現在のタスク</h3>
          <div className="text-sm">
            {(() => {
              const currentTimeFormatted = `${currentTime.getHours().toString().padStart(2, '0')}:${Math.floor(currentTime.getMinutes() / 15) * 15}`.padEnd(5, '0');
              const currentSlotIndex = schedule.findIndex(slot => slot.time === currentTimeFormatted);
              const currentSlot = schedule[currentSlotIndex];
              
              if (currentSlot && currentSlot.plan) {
                // 現在のタスクから同じタスクが続く最後の時間を探す
                let endIndex = currentSlotIndex;
                while (endIndex < schedule.length - 1 && 
                       schedule[endIndex + 1].plan === currentSlot.plan) {
                  endIndex++;
                }
                
                const endTime = schedule[endIndex + 1]?.time || '19:00';
                const [endHour, endMinute] = endTime.split(':').map(Number);
                const endDate = new Date();
                endDate.setHours(endHour, endMinute, 0, 0);
                
                const remainingMs = Math.max(0, endDate - currentTime);
                const remainingMinutes = Math.floor(remainingMs / 60000);
                const remainingSeconds = Math.floor((remainingMs % 60000) / 1000);
                
                // 全体の時間（開始から終了まで）
                const startTime = currentSlot.time;
                const [startHour, startMinute] = startTime.split(':').map(Number);
                const startDate = new Date();
                startDate.setHours(startHour, startMinute, 0, 0);
                const totalMs = endDate - startDate;
                const elapsedMs = currentTime - startDate;
                
                return (
                  <div>
                    <div className="font-semibold truncate">{currentSlot.plan}</div>
                    <div className="text-xs opacity-70 mt-1">
                      残り {remainingMinutes}:{remainingSeconds.toString().padStart(2, '0')} ({endTime}まで)
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-1 mt-2">
                      <div 
                        className="bg-blue-500 h-1 rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${Math.max(0, Math.min(100, (elapsedMs / totalMs) * 100))}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                );
              } else {
                // 次のタスクを探す
                const nextSlot = schedule.find(slot => slot.time > currentTimeFormatted && slot.plan);
                if (nextSlot) {
                  return (
                    <div>
                      <div className="font-semibold truncate">次: {nextSlot.plan}</div>
                      <div className="text-xs opacity-70 mt-1">{nextSlot.time}開始予定</div>
                    </div>
                  );
                } else {
                  return (
                    <div>
                      <div className="font-semibold">予定なし</div>
                      <div className="text-xs opacity-70 mt-1">お疲れ様でした</div>
                    </div>
                  );
                }
              }
            })()}
          </div>
        </div>
      </div>

      {/* 上部：2カラム構成 */}
      <div className="flex" style={{ height: `${upperHeight * 0.8}vh` }}>
        {/* 左側：タスクリスト */}
        <div className={`w-1/2 p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className="text-xl font-semibold mb-4">タスク</h2>
          
          {/* タスク入力 */}
          <div className="mb-6">
            <div className="flex">
              <input
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                placeholder="新しいタスクを入力..."
                className={`flex-1 px-4 py-2 rounded-l-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <button
                onClick={addTask}
                className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* タスクリスト */}
          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: `${upperHeight * 0.45}vh` }}>
            {tasks.map(task => (
              <div key={task.id} className={`flex items-center space-x-3 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className={`flex-1 ${task.completed ? 'line-through opacity-60' : ''}`}>
                  {task.text}
                </span>
                <button
                  onClick={() => toggleTaskFlag(task.id)}
                  className={`p-1 rounded transition-colors ${task.flagged ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M14.778.085A.5.5 0 0 1 15 .5V8a.5.5 0 0 1-.314.464L14.5 8l.186.464-.003.001-.006.003-.023.009a12 12 0 0 1-.397.15c-.264.095-.631.223-1.047.35-.816.252-1.879.523-2.71.523-.847 0-1.548-.28-2.158-.525l-.028-.01C7.68 8.71 7.14 8.5 6.5 8.5c-.7 0-1.638.23-2.437.477A20 20 0 0 0 3 9.342V15.5a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 1 0v.282c.226-.079.496-.17.79-.26C4.606.272 5.67 0 6.5 0c.84 0 1.524.277 2.121.519l.043.018C9.286.788 9.828 1 10.5 1c.7 0 1.638-.23 2.437-.477a20 20 0 0 0 1.349-.476l.019-.007.004-.002h.001M14 1.221c-.22.078-.48.167-.766.255-.81.252-1.872.523-2.734.523-.886 0-1.592-.286-2.203-.534l-.008-.003C7.662 1.21 7.139 1 6.5 1c-.669 0-1.606.229-2.415.478A21 21 0 0 0 3 1.845v6.433c.22-.078.48-.167.766-.255C4.576 7.77 5.638 7.5 6.5 7.5c.847 0 1.548.28 2.158.525l.028.01C9.32 8.29 9.86 8.5 10.5 8.5c.668 0 1.606-.229 2.415-.478A21 21 0 0 0 14 7.655V1.222z"/>
                  </svg>
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 右側：タイムスケジュール */}
        <div className={`w-1/2 p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">タイムスケジュール (9:00-19:00)</h2>
              <div className="flex items-center space-x-4 mt-2 text-xs">
                <div className="flex items-center space-x-1">
                  <div className={`w-3 h-3 rounded ${darkMode ? 'bg-green-900' : 'bg-green-100'}`}></div>
                  <span>集中ゾーン (9-12)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-3 h-3 rounded ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}></div>
                  <span>作業ゾーン (13-16)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-3 h-3 rounded ${darkMode ? 'bg-orange-900' : 'bg-orange-100'}`}></div>
                  <span>スパートゾーン (16-17)</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={copySchedule}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                <Copy size={16} className="inline mr-1" />
                コピー
              </button>
            </div>
          </div>
          
          <div className="overflow-y-auto" style={{ height: `${upperHeight * 0.55}vh` }}>
            <table className="w-full text-sm">
              <thead className={`sticky top-0 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <tr>
                  <th className="text-left p-2 w-20">時間</th>
                  <th className="text-left p-2">計画</th>
                  <th className="text-left p-2">実績</th>
                  <th className="text-left p-2 w-32">ラベル</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((slot, index) => (
                  <tr 
                    key={index} 
                    className={`
                      ${isHourBoundary(slot.time) 
                        ? `border-t-2 ${darkMode ? 'border-gray-600' : 'border-gray-400'}` 
                        : `border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`
                      } 
                      ${getTimeZoneColor(slot.time)}
                      ${isHourBoundary(slot.time) 
                        ? darkMode ? 'bg-gray-700/50' : 'bg-gray-200/50'
                        : ''
                      }
                    `}
                  >
                    <td className={`p-2 font-mono text-xs ${isHourBoundary(slot.time) ? 'font-bold' : 'font-semibold'}`}>
                      {slot.time}
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={slot.plan}
                        onChange={(e) => updateSchedule(index, 'plan', e.target.value)}
                        className={`w-full px-2 py-1 text-xs rounded border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:outline-none focus:ring-1 focus:ring-blue-500`}
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={slot.actual}
                        onChange={(e) => updateSchedule(index, 'actual', e.target.value)}
                        className={`w-full px-2 py-1 text-xs rounded border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:outline-none focus:ring-1 focus:ring-blue-500`}
                      />
                    </td>
                    <td className="p-1">
                      <select
                        value={slot.label}
                        onChange={(e) => updateSchedule(index, 'label', e.target.value)}
                        className={`w-full px-2 py-1 text-xs rounded border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:outline-none focus:ring-1 focus:ring-blue-500`}
                      >
                        <option value="">-</option>
                        {labels.map(label => (
                          <option key={label} value={label}>{label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* リサイズハンドル */}
      <div 
        className={`h-2 cursor-row-resize ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} transition-colors relative group`}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-12 h-1 rounded-full ${darkMode ? 'bg-gray-500 group-hover:bg-gray-400' : 'bg-gray-400 group-hover:bg-gray-500'} transition-colors`}></div>
        </div>
      </div>

      {/* 下部：実績サマリー */}
      <div className={`p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} overflow-hidden`} style={{ height: `${100 - upperHeight * 0.8 - 12}vh` }}>
        <h2 className="text-xl font-semibold mb-4">実績サマリー</h2>
        <div className="flex">
          <div className="w-1/2">
            <div style={{ height: `${(100 - upperHeight * 0.8 - 12) * 0.6}vh` }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  {/* 外側の円（ラベル） */}
                  <Pie
                    data={getActualData().filter(item => item.isLabel)}
                    cx="50%"
                    cy="50%"
                    outerRadius={Math.min(120, (100 - upperHeight * 0.8 - 12) * 2)}
                    innerRadius={Math.min(80, (100 - upperHeight * 0.8 - 12) * 1.3)}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}h`}
                  >
                    {getActualData().filter(item => item.isLabel).map((entry, index) => (
                      <Cell key={`outer-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  {/* 内側の円（実績） */}
                  <Pie
                    data={getActualData().filter(item => item.isTask)}
                    cx="50%"
                    cy="50%"
                    outerRadius={Math.min(75, (100 - upperHeight * 0.8 - 12) * 1.2)}
                    innerRadius={Math.min(40, (100 - upperHeight * 0.8 - 12) * 0.6)}
                    dataKey="value"
                    label={false}
                  >
                    {getActualData().filter(item => item.isTask).map((entry, index) => (
                      <Cell key={`inner-${index}`} fill={entry.fill} fillOpacity={entry.opacity} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value}時間`, 
                      props.payload.parent ? `${props.payload.parent} > ${name}` : name
                    ]} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* 凡例 */}
          <div className="w-1/2 pl-6">
            <div className="space-y-2 overflow-y-auto" style={{ maxHeight: `${(100 - upperHeight * 0.8 - 12) * 0.7}vh` }}>
              {getActualData().filter(item => item.isLabel).map((labelEntry, labelIndex) => (
                <div key={labelEntry.name} className="space-y-1">
                  <div className="flex items-center space-x-2 text-sm font-medium">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: labelEntry.fill }}
                    ></div>
                    <span>{labelEntry.name}: {labelEntry.value}時間</span>
                  </div>
                  {getActualData().filter(item => item.isTask && item.parent === labelEntry.name).map((taskEntry, taskIndex) => (
                    <div key={taskEntry.name} className="flex items-center space-x-2 text-xs ml-6 opacity-80">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: taskEntry.fill, opacity: taskEntry.opacity }}
                      ></div>
                      <span>{taskEntry.name}: {taskEntry.value}時間</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* 設定モーダル */}
    {showSettings && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg w-[600px] max-h-[80vh] overflow-y-auto`}>
          <h3 className="text-lg font-semibold mb-4">設定</h3>
          
          {/* ラベル設定 */}
          <div className="mb-6">
            <h4 className="text-md font-medium mb-3">ラベル設定</h4>
            
            {/* 新しいラベル追加 */}
            <div className="mb-4">
              <div className="flex">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addLabel()}
                  placeholder="新しいラベル"
                  className={`flex-1 px-3 py-2 rounded-l-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <button
                  onClick={addLabel}
                  className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition-colors"
                >
                  追加
                </button>
              </div>
            </div>

            {/* ラベルリスト */}
            <div className="space-y-2 mb-4">
              {labels.map(label => (
                <div key={label} className={`flex items-center justify-between p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <span>{label}</span>
                  <button
                    onClick={() => deleteLabel(label)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 自動判定ルール設定 */}
          <div className="mb-6">
            <h4 className="text-md font-medium mb-3">自動ラベル判定ルール</h4>
            
            {/* 新しいルール追加 */}
            <div className="mb-4 space-y-2">
              <input
                type="text"
                value={newRuleKeywords}
                onChange={(e) => setNewRuleKeywords(e.target.value)}
                placeholder="キーワード（カンマ区切り）例: 打合せ,定例,MTG"
                className={`w-full px-3 py-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <div className="flex">
                <input
                  type="text"
                  value={newRuleLabel}
                  onChange={(e) => setNewRuleLabel(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addAutoLabelRule()}
                  placeholder="適用するラベル"
                  className={`flex-1 px-3 py-2 rounded-l border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <button
                  onClick={addAutoLabelRule}
                  className="px-4 py-2 bg-green-500 text-white rounded-r hover:bg-green-600 transition-colors"
                >
                  ルール追加
                </button>
              </div>
            </div>

            {/* ルールリスト */}
            <div className="space-y-2">
              {autoLabelRules.map((rule, index) => (
                <div key={index} className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => toggleAutoLabelRule(index)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className={`font-medium ${!rule.enabled ? 'opacity-50' : ''}`}>
                        → {rule.label}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteAutoLabelRule(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      削除
                    </button>
                  </div>
                  <div className={`text-sm ${!rule.enabled ? 'opacity-50' : ''}`}>
                    末尾キーワード: {rule.keywords.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setShowSettings(false)}
              className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default DailyTaskManager;
