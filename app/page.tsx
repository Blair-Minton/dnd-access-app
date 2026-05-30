"use client";

import { useState, useRef } from "react";

const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100];

export default function AccessibleDiceRoller() {
  const [dieType, setDieType] = useState<number>(20);
  const [diceCount, setDiceCount] = useState<number>(1);
  const [rolls, setRolls] = useState<number[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState<string>("");

  // Ref to hold the interval ID for press-and-hold functionality
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Handles the Text-to-Speech
  const speakResult = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.6; // Slightly slower for better comprehension
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRoll = () => {
    const newRolls = [];
    let currentTotal = 0;

    for (let i = 0; i < diceCount; i++) {
      const roll = Math.floor(Math.random() * dieType) + 1;
      newRolls.push(roll);
      currentTotal += roll;
    }

    setRolls(newRolls);
    setTotal(currentTotal);

    // Construct the text for the screen reader and TTS
    let spokenText = `Rolled ${diceCount} D ${dieType}. `;
    if (diceCount > 1) {
      spokenText += `Total is ${currentTotal}. `;
    } else {
      spokenText += `Result is ${currentTotal}. `;
    }

    setAnnouncement(spokenText);
    speakResult(spokenText);
  };

  // Speaks when a new die type is selected
  const handleDieTypeChange = (type: number) => {
    setDieType(type);
    speakResult(`D ${type}`);
  };

  const incrementCount = () => setDiceCount((prev) => Math.min(prev + 1, 99));
  const decrementCount = () => setDiceCount((prev) => Math.max(prev - 1, 1));

  // Press and hold logic
  const startAdjusting = (action: "increment" | "decrement") => {
    // Fire once immediately on initial press
    if (action === "increment") incrementCount();
    speakResult(`${action === "increment" ? diceCount + 1 : diceCount - 1} dice`);
    if (action === "decrement") decrementCount();
    speakResult(`${action === "decrement" ? diceCount - 1 : diceCount + 1} dice`);

    // Setup an interval to repeatedly fire while held down
    //timerRef.current = setInterval(() => {
    //  if (action === "increment") incrementCount();
    //  if (action === "decrement") decrementCount();
    //}, 500); // Fires every 500ms
  };

  const stopAdjusting = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <main className="min-h-screen bg-black text-white font-sans p-6 md:p-12 flex flex-col items-center">
      {/* Hidden ARIA Live Region for Screen Readers */}
      <div aria-live="assertive" className="sr-only">
        {announcement}
      </div>

      <h1 className="text-5xl md:text-7xl font-bold mb-12 text-center border-b-8 border-white pb-4">
        Dice Roller
      </h1>

      <div className="w-full max-w-4xl flex flex-col gap-12">
        {/* Dice Count Selection */}
        <section
          aria-labelledby="dice-count-label"
          className="flex flex-col items-center bg-gray-900 p-8 rounded-3xl border-4 border-gray-700"
        >
          <h2 id="dice-count-label" className="text-4xl font-bold mb-6">
            Number of Dice
          </h2>
          <div className="flex items-center gap-8">
            <button
              onMouseDown={() => startAdjusting("decrement")}
              onMouseUp={stopAdjusting}
              onMouseLeave={stopAdjusting}
              onTouchStart={(e) => { e.preventDefault(); startAdjusting("decrement"); }}
              onTouchEnd={stopAdjusting}
              aria-label="Decrease number of dice"
              className="bg-red-600 hover:bg-red-500 text-white text-6xl font-bold w-24 h-24 rounded-2xl focus:outline-none focus:ring-8 focus:ring-yellow-400 transition-colors select-none"
            >
              -
            </button>
            <span
              aria-live="polite"
              className="text-8xl font-black w-32 text-center"
            >
              {diceCount}
            </span>
            <button
              onMouseDown={() => startAdjusting("increment")}
              onMouseUp={stopAdjusting}
              onMouseLeave={stopAdjusting}
              onTouchStart={(e) => { e.preventDefault(); startAdjusting("increment"); }}
              onTouchEnd={stopAdjusting}
              aria-label="Increase number of dice"
              className="bg-blue-600 hover:bg-blue-500 text-white text-6xl font-bold w-24 h-24 rounded-2xl focus:outline-none focus:ring-8 focus:ring-yellow-400 transition-colors select-none"
            >
              +
            </button>
          </div>
        </section>

        {/* Die Type Selection */}
        <section
          aria-labelledby="die-type-label"
          className="flex flex-col items-center bg-gray-900 p-8 rounded-3xl border-4 border-gray-700"
        >
          <h2 id="die-type-label" className="text-4xl font-bold mb-6">
            Choose Die Type
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            {DICE_TYPES.map((type) => {
              const isSelected = dieType === type;
              return (
                <button
                  key={type}
                  onClick={() => handleDieTypeChange(type)}
                  aria-pressed={isSelected}
                  className={`text-4xl md:text-5xl font-black py-6 px-8 rounded-2xl focus:outline-none focus:ring-8 focus:ring-yellow-400 transition-colors ${
                    isSelected
                      ? "bg-yellow-400 text-black border-4 border-yellow-400"
                      : "bg-gray-800 text-white border-4 border-gray-500 hover:bg-gray-700"
                  }`}
                >
                  D{type}
                </button>
              );
            })}
          </div>
        </section>

        {/* Huge Roll Button */}
        <button
          onClick={handleRoll}
          className="w-full bg-green-500 hover:bg-green-400 text-black text-7xl md:text-9xl font-black py-12 rounded-3xl border-8 border-green-700 focus:outline-none focus:ring-8 focus:ring-yellow-400 shadow-[0_10px_0_rgb(21,128,61)] active:shadow-none active:translate-y-[10px] transition-all"
        >
          ROLL
        </button>

      {/* Results Area */}
      {total !== null && (
        <section
          aria-label="Roll Results"
          className="flex flex-col items-center bg-white text-black p-6 md:p-12 rounded-3xl border-8 border-gray-300 mt-8 w-full max-w-4xl overflow-hidden"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 uppercase tracking-widest text-gray-600">
            Total
          </h2>
          
          {/* Clean text scaling using responsive text sizes and word breaks */}
          <div className="text-7xl sm:text-9xl md:text-[12rem] leading-none font-black text-center break-all dynamic-font-size px-2 max-w-full">
            {total}
          </div>

          {/* Only show individual rolls if there is more than 1 die */}
          {diceCount > 1 && (
            <div className="mt-8 text-center border-t-4 border-gray-300 pt-8 w-full">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-600">
                Individual Rolls
              </h3>
              {/* Changed to flex-wrap with an explicit max-w to keep it inside the box boundaries */}
              <div className="text-3xl md:text-5xl font-bold flex flex-wrap justify-center gap-4 max-h-64 overflow-y-auto p-2">
                {rolls.map((roll, index) => (
                  <span
                    key={index}
                    className="bg-gray-200 px-4 py-2 rounded-xl inline-block"
                  >
                    {roll}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
      </div>
    </main>
  );
}