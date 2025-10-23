// Fix: Implemented the missing CourseInput component.
import React, { useState } from 'react';
import type { Course } from '../types';

interface CourseInputProps {
  onAddCourse: (course: Omit<Course, 'id'>) => void;
}

const CourseInput: React.FC<CourseInputProps> = ({ onAddCourse }) => {
  const [name, setName] = useState('');
  const [credits, setCredits] = useState('');
  const [score, setScore] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCourse = {
      name: name.trim(),
      credits: parseInt(credits, 10),
      score: score === '' ? null : parseFloat(score),
    };

    if (newCourse.name && !isNaN(newCourse.credits) && newCourse.credits > 0) {
      onAddCourse(newCourse);
      setName('');
      setCredits('');
      setScore('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-2 items-center p-2 bg-gray-100 rounded-md">
      <div className="col-span-6">
        <input
          type="text"
          placeholder="Nama Mata Kuliah"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-white text-gray-800 px-2 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-unsri-yellow"
          required
        />
      </div>
      <div className="col-span-2">
        <input
          type="number"
          placeholder="SKS"
          value={credits}
          onChange={(e) => setCredits(e.target.value)}
          className="w-full bg-white text-gray-800 px-2 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-unsri-yellow"
          min="1"
          max="6"
          required
        />
      </div>
      <div className="col-span-2">
        <input
          type="number"
          placeholder="Nilai (0-100)"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="w-full bg-white text-gray-800 px-2 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-unsri-yellow"
          min="0"
          max="100"
          step="0.01"
        />
      </div>
      <div className="col-span-2 text-right">
        <button
          type="submit"
          className="w-full bg-unsri-green hover:bg-green-700 text-white font-semibold py-1 px-3 rounded-md transition text-sm"
        >
          Tambah
        </button>
      </div>
    </form>
  );
};

export default CourseInput;