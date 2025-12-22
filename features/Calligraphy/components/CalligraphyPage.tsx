'use client';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useSearchParams } from 'next/navigation';
import useCalligraphyStore from '@/features/Calligraphy/store/useCalligraphyStore';
import { hiraganaData } from '@/features/Calligraphy/data/hiraganaStrokes';
import { katakanaData } from '@/features/Calligraphy/data/katakanaStrokes';
import Canvas from './Canvas';
import BrushSelector from './BrushSelector';
import StatsPanel from './StatsPanel';
import StrokeProgress from './StrokeProgress';
import HowToUseModal from './HowToUseModal';
import WrongStrokeOverlay from './WrongStrokeOverlay';
import CelebrationOverlay from './CelebrationOverlay';
import Link from 'next/link';

const STEPS = [
  { id: 1, titleEn: 'SELECT CHARACTER', titleJp: '文字を選ぶ' },
  { id: 2, titleEn: 'CHOOSE BRUSH', titleJp: '筆を選ぶ' },
  { id: 3, titleEn: 'PRACTICE & LEARN', titleJp: '練習' }
];

const CalligraphyPage = () => {
  const [practiceTime, setPracticeTime] = useState(0);
  const selectedKanaType = useCalligraphyStore(state => state.selectedKanaType);
  const setSelectedKanaType = useCalligraphyStore(
    state => state.setSelectedKanaType
  );
  const selectedCharacter = useCalligraphyStore(
    state => state.selectedCharacter
  );
  const setSelectedCharacter = useCalligraphyStore(
    state => state.setSelectedCharacter
  );
  const setShowHowToUse = useCalligraphyStore(state => state.setShowHowToUse);
  const showGuide = useCalligraphyStore(state => state.showGuide);
  const toggleGuide = useCalligraphyStore(state => state.toggleGuide);
  const currentStrokeIndex = useCalligraphyStore(
    state => state.currentStrokeIndex
  );
  const currentStage = useCalligraphyStore(state => state.currentStage);
  const completedHiragana = useCalligraphyStore(
    state => state.completedHiragana
  );
  const completedKatakana = useCalligraphyStore(
    state => state.completedKatakana
  );
  const resetStrokes = useCalligraphyStore(state => state.resetStrokes);
  const activeStep = useCalligraphyStore(state => state.activeStep);
  const setActiveStep = useCalligraphyStore(state => state.setActiveStep);
  const searchParams = useSearchParams();
  const stepFromUrl = Number(searchParams.get('step'));

  const characterData =
    selectedKanaType === 'hiragana' ? hiraganaData : katakanaData;
  const completedCharacters =
    selectedKanaType === 'hiragana' ? completedHiragana : completedKatakana;
  const totalStrokes = selectedCharacter?.strokes?.length || 0;

  useEffect(() => {
    if (activeStep !== 3) return;
    const timer = setInterval(() => setPracticeTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [activeStep]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!selectedCharacter) {
      const data =
        selectedKanaType === 'hiragana' ? hiraganaData : katakanaData;
      if (data.length > 0) setSelectedCharacter(data[0]);
    }
  }, [selectedCharacter, selectedKanaType, setSelectedCharacter]);

  const getNextCharacter = () => {
    if (!selectedCharacter) return null;
    const idx = characterData.findIndex(
      c => c.character === selectedCharacter.character
    );
    return idx < characterData.length - 1
      ? characterData[idx + 1]
      : characterData[0];
  };

  const nextChar = getNextCharacter();

  const handleSelectCharacter = (char: (typeof characterData)[0]) => {
    setSelectedCharacter(char);
    resetStrokes();
    setActiveStep(2);
  };

  const handleClear = () =>
    window.dispatchEvent(new CustomEvent('calligraphy:clear'));
  const handleUndo = () =>
    window.dispatchEvent(new CustomEvent('calligraphy:undo'));

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('step', String(activeStep));
    window.history.replaceState({}, '', url.toString());
  }, [activeStep]);

  useEffect(() => {
    if (!Number.isNaN(stepFromUrl)) setActiveStep(stepFromUrl);
    else setActiveStep(0);
  }, []);

  // FRAME 0
  if (activeStep === 0) {
    return (
      <div className='min-h-[100dvh] flex flex-col bg-[#FFFBF5]'>
        <header className='flex items-center justify-between px-6 py-4'>
          <Link href='/vocabulary' className='flex items-center gap-3'>
            <span className='text-3xl'>🖌️</span>
            <div>
              <span className='font-bold text-[#D97706] text-lg'>かな道場</span>
              <span className='text-[var(--secondary-color)] text-2xl block'>
                Calligraphy
              </span>
            </div>
          </Link>
          <button
            onClick={() => setShowHowToUse(true)}
            className='relative z-50 w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-500 flex items-center justify-center hover:border-[#F59E0B]'
          >
            ?
          </button>
        </header>
        {/* Main - 3 Vertical Bars */}
        <div className='flex-1 flex items-center justify-center p-8 -mt-16 relative z-10'>
          <div className='flex items-center justify-center gap-25 md:gap-25'>
            {STEPS.map(step => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className='w-28 h-72 bg-white hover:bg-[#FEF3C7] rounded-2xl border-2 border-gray-200 hover:border-[#F59E0B] flex flex-col items-center justify-center relative transition-all shadow-sm hover:shadow-md'
              >
                <div className='flex items-center gap-4 flex-1'>
                  <div
                    className='text-[11px] font-medium text-[var(--secondary-color)] tracking-[0.15em] leading-[1.6]'
                    style={{
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed'
                    }}
                  >
                    {step.titleEn}
                  </div>
                  <span className='text-[var(--secondary-color)] opacity-50'>
                    ~
                  </span>
                  <div className='flex flex-col items-center text-[16px] text-[#D97706] opacity-70'>
                    {step.titleJp.split('').map((char, i) => (
                      <span key={i}>{char}</span>
                    ))}
                  </div>
                </div>
                <div className='w-10 h-10 rounded-full bg-[#FEF3C7] border-2 border-[#F59E0B] text-[#D97706] flex items-center justify-center font-bold absolute bottom-5'>
                  {step.id}
                </div>
              </button>
            ))}
          </div>
        </div>
        <HowToUseModal />
      </div>
    );
  }

  // FRAME 1
  if (activeStep === 1) {
    return (
      <div className='min-h-[100dvh] flex flex-col bg-[#FFFBF5]'>
        <header className='flex items-center justify-between px-6 py-4'>
          <Link href='/vocabulary' className='flex items-center gap-3'>
            <span className='text-3xl'>🖌️</span>
            <div>
              <span className='font-bold text-[#D97706] text-lg'>かな道場</span>
              <span className='text-[var(--secondary-color)] text-2xl block'>
                Calligraphy
              </span>
            </div>
          </Link>
          <button
            onClick={() => setShowHowToUse(true)}
            className='relative z-50 w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-500 flex items-center justify-center hover:border-[#F59E0B]'
          >
            ?
          </button>
        </header>

        <div className='flex-1 p-4 flex flex-col gap-3 max-w-5xl mx-auto w-full'>
          <button
            onClick={() => setActiveStep(2)}
            className='h-18 bg-white rounded-xl flex items-center justify-between px-4 border border-gray-200 hover:border-[#F59E0B] shadow-sm'
          >
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 rounded-full bg-[#FEF3C7] border border-[#F59E0B]/30 text-[#D97706] flex items-center justify-center font-bold'>
                2
              </div>
              <span className='text-sm text-gray-600 font-medium'>
                CHOOSE BRUSH
              </span>
              <span className='text-xs text-gray-400'>筆を選ぶ</span>
            </div>
            <svg
              className='w-5 h-5 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 5l7 7-7 7'
              />
            </svg>
          </button>
          <div className='flex-1 flex gap-3'>
            <div className='w-20 bg-[#FEF3C7] border-2 border-[#F59E0B] rounded-2xl flex flex-col items-center justify-center py-4 relative shadow-md'>
              <div className='flex flex-col items-center h-48'>
                <div
                  className='text-[10px] font-bold text-[#D97706]'
                  style={{ writingMode: 'vertical-lr' }}
                >
                  SELECT CHARACTER
                </div>
                <div
                  className='text-[10px] text-[#92400E] mt-2'
                  style={{ writingMode: 'vertical-lr' }}
                >
                  文字を選ぶ
                </div>
              </div>
              <div className='w-8 h-8 rounded-full bg-[#F59E0B] text-white flex items-center justify-center font-bold absolute bottom-4'>
                1
              </div>
            </div>
            <div className='flex-1 bg-white rounded-xl border border-gray-200 p-4 overflow-auto shadow-sm'>
              <div className='flex justify-center mb-5'>
                <div className='inline-flex bg-gray-100 rounded-xl p-1'>
                  <button
                    onClick={() => setSelectedKanaType('hiragana')}
                    className={clsx(
                      'px-5 py-2.5 rounded-lg transition-all',
                      selectedKanaType === 'hiragana'
                        ? 'bg-[#F59E0B] text-white shadow-sm'
                        : 'text-gray-500'
                    )}
                  >
                    <div className='flex flex-col items-center'>
                      <span className='font-japanese'>ひらがな</span>
                      <span className='text-xs opacity-80'>Hiragana</span>
                    </div>
                    <span className='text-xs opacity-70'>
                      {completedHiragana?.length ?? 0}/46
                    </span>
                  </button>
                  <button
                    onClick={() => setSelectedKanaType('katakana')}
                    className={clsx(
                      'px-5 py-2.5 rounded-lg transition-all',
                      selectedKanaType === 'katakana'
                        ? 'bg-[#F59E0B] text-white shadow-sm'
                        : 'text-gray-500'
                    )}
                  >
                    <div className='flex flex-col items-center'>
                      <span className='font-japanese'>カタカナ</span>
                      <span className='text-xs opacity-80'>Katakana</span>
                    </div>
                    <span className='text-xs opacity-70'>
                      {completedKatakana?.length ?? 0}/46
                    </span>
                  </button>
                </div>
              </div>
              <div className='grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 max-w-4xl mx-auto'>
                {characterData.map(char => {
                  const isSelected =
                    selectedCharacter?.character === char.character;
                  const isCompleted = (completedCharacters ?? []).includes(
                    char.character
                  );

                  return (
                    <button
                      key={char.character}
                      onClick={() => handleSelectCharacter(char)}
                      className={clsx(
                        'aspect-square rounded-xl font-japanese text-2xl flex items-center justify-center transition-all relative',
                        isSelected
                          ? 'bg-[#F59E0B] text-white shadow-md scale-105'
                          : isCompleted
                            ? 'bg-green-100 border-2 border-green-400 text-green-600'
                            : 'bg-gray-50 border border-gray-200 text-gray-700 hover:border-[#F59E0B]'
                      )}
                    >
                      {char.character}
                      {isCompleted && !isSelected && (
                        <span className='absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center'>
                          <svg
                            className='w-2.5 h-2.5 text-white'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={3}
                              d='M5 13l4 4L19 7'
                            />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className='h-14 bg-white rounded-xl flex items-center px-4 border border-gray-200'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 rounded-full bg-[#FEF3C7] border border-[#F59E0B]/30 text-[#D97706] flex items-center justify-center font-medium'>
                3
              </div>
              <span className='text-sm text-gray-400'>PRACTICE & LEARN</span>
            </div>
          </div>
        </div>
        <HowToUseModal />
      </div>
    );
  }

  // FRAME 2
  if (activeStep === 2) {
    return (
      <div className='min-h-[100dvh] flex flex-col bg-[#FFFBF5]'>
        <header className='flex items-center justify-between px-6 py-4'>
          <Link href='/vocabulary' className='flex items-center gap-3'>
            <span className='text-3xl'>🖌️</span>
            <div>
              <span className='font-bold text-[#D97706] text-lg'>かな道場</span>
              <span className='text-[var(--secondary-color)] text-2xl block'>
                Calligraphy
              </span>
            </div>
          </Link>
          <button
            onClick={() => setShowHowToUse(true)}
            className='relative z-50 w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-500 flex items-center justify-center hover:border-[#F59E0B]'
          >
            ?
          </button>
        </header>
        <div className='flex-1 p-4 flex flex-col gap-3 max-w-5xl mx-auto w-full'>
          <div className='bg-[#FEF3C7] border-2 border-[#F59E0B] rounded-xl p-5 shadow-md'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-8 h-8 rounded-full bg-[#F59E0B] text-white flex items-center justify-center font-bold'>
                2
              </div>
              <span className='font-bold text-[#D97706]'>CHOOSE BRUSH</span>
              <span className='text-xs text-[#92400E]'>筆を選ぶ</span>
            </div>
            <div className='flex justify-center gap-8'>
              <BrushSelector showLabels={true} size='md' />
            </div>
          </div>
          <div className='flex-1 flex gap-3'>
            <button
              onClick={() => setActiveStep(1)}
              className='w-28 rounded-2xl bg-white flex flex-col items-center justify-center py-4 border border-gray-200 hover:border-[#F59E0B] shadow-sm'
            >
              <div className='text-5xl font-japanese text-[#D97706] mb-2'>
                {selectedCharacter?.character || 'あ'}
              </div>
              <p className='text-sm text-gray-500'>
                {selectedKanaType === 'hiragana' ? 'Hiragana' : 'Katakana'}
              </p>
              <p className='text-xs text-gray-400'>
                Next: {nextChar?.character || 'い'}
              </p>
              <div className='w-8 h-8 rounded-full bg-[#FEF3C7] border border-[#F59E0B]/30 text-[#D97706] flex items-center justify-center font-bold mt-4'>
                1
              </div>
            </button>
            <div className='flex-1 flex items-center justify-center'>
              <button
                onClick={() => setActiveStep(3)}
                className='px-16 py-12 bg-white hover:bg-[#FEF3C7] rounded-2xl border-2 border-gray-200 hover:border-[#F59E0B] shadow-sm hover:shadow-md'
              >
                <div className='w-16 h-16 rounded-full bg-[#FEF3C7] border-2 border-[#F59E0B] text-[#D97706] flex items-center justify-center font-bold text-2xl mx-auto mb-4'>
                  3
                </div>
                <p className='font-bold text-[#D97706] text-xl'>
                  PRACTICE & LEARN
                </p>
                <p className='text-gray-500 mt-2'>Stroke-by-stroke practice</p>
                <p className='text-[#F59E0B] mt-3 font-medium'>
                  練習 • {"Let's Start →"}
                </p>
              </button>
            </div>
          </div>
        </div>
        <HowToUseModal />
      </div>
    );
  }

  // FRAME 3 - Main Practice (continued in next part)
  return (
    <div className='min-h-[100dvh] flex flex-col bg-[#FFFBF5]'>
      <header className='flex items-center justify-between px-6 py-4'>
        <Link href='/vocabulary' className='flex items-center gap-3'>
          <span className='text-3xl'>🖌️</span>
          <div>
            <span className='font-bold text-[#D97706] text-lg'>かな道場</span>
            <span className='text-[var(--secondary-color)] text-2xl block'>
              Calligraphy
            </span>
          </div>
        </Link>
        <button
          onClick={() => setShowHowToUse(true)}
          className='relative z-50 w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-500 flex items-center justify-center hover:border-[#F59E0B]'
        >
          ?
        </button>
      </header>
      <div className='flex-1 p-3 flex flex-col gap-2 max-w-6xl mx-auto w-full'>
        <div className='flex gap-2'>
          <button
            onClick={() => setActiveStep(1)}
            className='flex-1 h-16 bg-white rounded-xl flex items-center gap-4 px-4 border border-gray-200 hover:border-[#F59E0B] shadow-sm'
          >
            <div className='w-10 h-10 rounded-full bg-[#FEF3C7] border border-[#F59E0B]/30 text-[#D97706] flex items-center justify-center font-bold'>
              1
            </div>
            <div className='text-3xl font-japanese text-[#D97706]'>
              {selectedCharacter?.character || 'あ'}
            </div>
            <div className='text-left'>
              <p className='text-xs text-gray-400'>
                {selectedKanaType === 'hiragana' ? 'Hiragana' : 'Katakana'}
              </p>
              <p className='text-xs text-[#D97706]'>Tap to change</p>
            </div>
          </button>
          <div
            onClick={() => setActiveStep(2)}
            className='h-16 bg-white rounded-xl flex items-center gap-3 px-4 border border-gray-200 hover:border-[#F59E0B] shadow-sm'
          >
            <div className='w-8 h-8 rounded-full bg-[#FEF3C7] border border-[#F59E0B]/30 text-[#D97706] flex items-center justify-center font-bold text-sm'>
              2
            </div>
            <BrushSelector showLabels={false} size='sm' />
          </div>
        </div>
        <div className='bg-[#FEF3C7] border-2 border-[#F59E0B] rounded-xl px-4 py-2 flex items-center justify-between shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='w-7 h-7 rounded-full bg-[#F59E0B] text-white flex items-center justify-center font-bold text-sm'>
              3
            </div>
            <span className='font-bold text-[#D97706]'>Practice & Learn</span>
            <span className='text-xs text-[#92400E]'>
              {currentStage === 'stroke'
                ? 'Stroke-by-stroke'
                : 'Draw from memory'}
            </span>
          </div>
          <span className='text-sm text-[#D97706] bg-white px-3 py-1 rounded-lg'>
            Stroke {currentStrokeIndex + 1} of {totalStrokes}
          </span>
        </div>
        <div className='flex-1 flex gap-3'>
          <div className='w-56 bg-white rounded-xl border border-gray-200 p-4 flex flex-col shadow-sm'>
            <div className='bg-[#FFFBF5] rounded-xl p-4 mb-4 text-center border border-[#F59E0B]/20'>
              <div className='text-6xl font-japanese text-[#D97706] mb-2'>
                {selectedCharacter?.character || 'あ'}
              </div>
              <p className='text-sm text-gray-500'>Current Character</p>
            </div>
            <div className='mb-4'>
              <div className='flex justify-between text-xs text-gray-500 mb-1'>
                <span>Strokes</span>
                <span className='text-[#D97706] font-semibold'>
                  {currentStage === 'stroke'
                    ? currentStrokeIndex
                    : totalStrokes}
                  /{totalStrokes}
                </span>
              </div>
              <div className='h-2 bg-gray-100 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-full transition-all'
                  style={{
                    width: `${currentStage === 'full' ? 100 : (currentStrokeIndex / totalStrokes) * 100}%`
                  }}
                />
              </div>
            </div>
            <div className='space-y-2 mb-4'>
              <p className='text-xs text-gray-500 font-medium'>
                Learning Stages
              </p>
              <div
                className={clsx(
                  'flex items-center gap-3 p-3 rounded-xl',
                  currentStage === 'stroke'
                    ? 'bg-[#FEF3C7] border-2 border-[#F59E0B]'
                    : 'bg-gray-50 border border-gray-200'
                )}
              >
                <div
                  className={clsx(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs',
                    currentStage === 'stroke'
                      ? 'bg-[#F59E0B] text-white'
                      : 'bg-gray-200 text-gray-400'
                  )}
                >
                  ✓
                </div>
                <div>
                  <p
                    className={clsx(
                      'text-sm font-medium',
                      currentStage === 'stroke'
                        ? 'text-[#D97706]'
                        : 'text-gray-500'
                    )}
                  >
                    Stroke by Stroke
                  </p>
                  <p className='text-xs text-gray-400'>Learn each stroke</p>
                </div>
              </div>
              <div
                className={clsx(
                  'flex items-center gap-3 p-3 rounded-xl',
                  currentStage === 'full'
                    ? 'bg-[#FEF3C7] border-2 border-[#F59E0B]'
                    : 'bg-gray-50 border border-gray-200'
                )}
              >
                <div
                  className={clsx(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs',
                    currentStage === 'full'
                      ? 'bg-[#F59E0B] text-white'
                      : 'bg-gray-200 text-gray-400'
                  )}
                >
                  {currentStage === 'full' ? '✓' : '🔒'}
                </div>
                <div>
                  <p
                    className={clsx(
                      'text-sm font-medium',
                      currentStage === 'full'
                        ? 'text-[#D97706]'
                        : 'text-gray-400'
                    )}
                  >
                    Complete Letter
                  </p>
                  <p className='text-xs text-gray-400'>
                    Practice full character
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-gray-50 rounded-xl p-3 mb-4'>
              <div className='flex items-center justify-between'>
                <span className='text-xl font-mono font-bold text-gray-700'>
                  ⏱️ {formatTime(practiceTime)}
                </span>
                <button
                  onClick={() => setPracticeTime(0)}
                  className='w-7 h-7 rounded bg-white border border-gray-200 text-gray-400 flex items-center justify-center hover:border-[#F59E0B]'
                >
                  ↺
                </button>
              </div>
              <p className='text-xs text-gray-400 mt-1'>Practice Time</p>
            </div>
            <div className='flex-1'>
              <p className='text-xs text-gray-500 font-medium mb-2'>
                Your Progress
              </p>
              <StatsPanel compact={true} />
            </div>
          </div>
          <div className='flex-1 flex flex-col'>
            <div className='bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 mb-3 flex items-center gap-2'>
              <div className='w-4 h-4 bg-green-500 rounded-full animate-pulse'></div>
              <p className='text-sm text-green-700 font-medium'>
                Start from the green dot and follow the yellow line
              </p>
              <span className='ml-auto text-xs text-gray-500'>
                Stroke {currentStrokeIndex + 1} of {totalStrokes}
              </span>
            </div>
            <div className='flex-1 min-h-[300px]'>
              <Canvas />
            </div>
            <div className='flex items-center justify-between mt-3 bg-white rounded-xl px-4 py-3 border border-gray-200 shadow-sm'>
              <StrokeProgress />
              <div className='flex items-center gap-2'>
                <button
                  onClick={handleClear}
                  className='px-4 py-2 text-sm border border-gray-200 rounded-lg hover:border-[#F59E0B] text-gray-500 hover:text-[#D97706] transition-colors'
                >
                  Clear
                </button>
                <button
                  onClick={toggleGuide}
                  className={clsx(
                    'px-4 py-2 text-sm rounded-lg transition-colors',
                    showGuide
                      ? 'bg-[#F59E0B] text-white'
                      : 'border border-gray-200 text-gray-500 hover:border-[#F59E0B]'
                  )}
                >
                  Guide
                </button>
                <button
                  onClick={handleUndo}
                  className='px-4 py-2 text-sm border border-gray-200 rounded-lg hover:border-[#F59E0B] text-gray-500 hover:text-[#D97706] transition-colors'
                >
                  Undo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <HowToUseModal />
      <WrongStrokeOverlay />
      <CelebrationOverlay />
    </div>
  );
};

export default CalligraphyPage;
