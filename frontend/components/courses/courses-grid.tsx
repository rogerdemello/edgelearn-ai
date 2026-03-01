'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

const categories = ['All', 'Programming', 'Data Science', 'Web Development', 'AI & ML']

const courses = [
  { id: 1, title: 'Python Fundamentals', category: 'Programming', difficulty: 'Beginner', duration: '4 weeks', description: 'Start your coding journey with Python', students: 15420, rating: 4.8, thumb: 'from-teal-600 to-teal-800' },
  { id: 2, title: 'Web Development Bootcamp', category: 'Web Development', difficulty: 'Intermediate', duration: '8 weeks', description: 'Build full-stack web applications', students: 12890, rating: 4.9, thumb: 'from-teal-700 to-cyan-900' },
  { id: 3, title: 'Data Science with Python', category: 'Data Science', difficulty: 'Intermediate', duration: '6 weeks', description: 'Analyze data and build ML models', students: 8976, rating: 4.7, thumb: 'from-violet-800 to-violet-950' },
  { id: 4, title: 'Advanced JavaScript', category: 'Programming', difficulty: 'Advanced', duration: '5 weeks', description: 'Master modern JavaScript patterns', students: 6543, rating: 4.8, thumb: 'from-teal-800 to-teal-950' },
  { id: 5, title: 'Machine Learning Foundations', category: 'AI & ML', difficulty: 'Advanced', duration: '10 weeks', description: 'Understanding ML algorithms and applications', students: 5234, rating: 4.9, thumb: 'from-cyan-800 to-teal-900' },
  { id: 6, title: 'React Mastery', category: 'Web Development', difficulty: 'Intermediate', duration: '7 weeks', description: 'Build scalable React applications', students: 9876, rating: 4.8, thumb: 'from-cyan-700 to-cyan-900' },
]

export default function CoursesGrid() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const filteredCourses =
    selectedCategory && selectedCategory !== 'All'
      ? courses.filter((c) => c.category === selectedCategory)
      : courses

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Courses</h1>
        <p className="text-body text-muted-foreground">Pick a course and start learning.</p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat === 'All' ? null : cat)}
            className={`px-5 py-2.5 rounded-lg text-[15px] font-medium whitespace-nowrap transition-colors ${
              (selectedCategory === null && cat === 'All') || selectedCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="card-premium overflow-hidden cursor-pointer group !p-0"
          >
            <div className={`h-36 bg-gradient-to-br ${course.thumb} opacity-90 group-hover:opacity-100 transition-opacity`} />
            <div className="p-6">
              <h3 className="font-semibold text-foreground text-lg mb-3">{course.title}</h3>
              <p className="text-body text-muted-foreground mb-5">{course.description}</p>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-5">
                <span>{course.duration}</span>
                <span>{course.difficulty}</span>
                <span>★ {course.rating}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-5">{course.students.toLocaleString()} enrolled</p>
              <Button className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg">
                Enroll
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
