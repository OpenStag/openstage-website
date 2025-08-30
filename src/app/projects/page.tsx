'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Project {
  id: string
  name: string
  description: string
  image: string
  github_link: string
  live_demo?: string
  technologies: string[]
  category: 'web' | 'design' | 'mobile'
  status: 'completed' | 'in-progress'
  team_members: string[]
  completion_date: string
  featured: boolean
}

// Static project data
const projectsData: Project[] = [
  {
    id: '1',
    name: 'OpenStage Website',
    description: 'A modern platform for connecting students with mentors and projects. Features include user authentication, project management, and real-time collaboration tools.',
    image: '/openstageweb.png',
    github_link: 'https://github.com/OpenStag/openstage-website',
    live_demo: 'https://openstag.vercel.app/',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase'],
    category: 'web',
    status: 'completed',
    team_members: ['Janith Wathsala'],
    completion_date: '2025-08-30',
    featured: true
  },
  {
    id: '2',
    name: 'Shoe Shop Website',
    description: 'An e-commerce platform for footwear retail featuring product catalogs, shopping cart functionality and inventory management system.',
    image: '/shooshop.png',
    github_link: 'https://github.com/OpenStag/project-6',
    live_demo: '',
    technologies: ['HTML', 'CSS', 'Java Script'],
    category: 'web',
    status: 'completed',
    team_members: ['Achintha', 'Sahiru', 'Janitha', 'Lochana', 'Theekshana'],
    completion_date: '2025-08-01',
    featured: true
  },
  {
    id: '3',
    name: 'Clothing Shop',
    description: 'An elegant e-commerce platform for fashion retail featuring responsive design, product galleries, size guides integration for clothing.',
    image: '/clothinshop.png',
    github_link: 'https://github.com/OpenStag/project-5',
    live_demo: '',
    technologies: ['HTML', 'Laravel', 'CSS', 'Java Script'],
    category: 'web',
    status: 'completed',
    team_members: ['Pasindu', 'Supasan', 'Nisansala','Himash'],
    completion_date: '2025-07-24',
    featured: false
  },
  {
    id: '4',
    name: 'Event Management System',
    description: 'A comprehensive event management system for organizing, planning and managing events',
    image: '/eventManagement.png',
    github_link: 'https://github.com/OpenStag/project-4',
    technologies: ['Html', 'CSS', 'Java Script', 'Php'],
    category: 'web',
    status: 'completed',
    team_members: ['Hamdhi', 'Senura', 'Pasindu', 'Nadhul', 'Janitha'],
    completion_date: '2025-07-21',
    featured: true
  },
  {
    id: '5',
    name: 'Travel Website',
    description: 'A travel website offering booking services, travel guides, and user reviews.',
    image: '/travelweb.png',
    github_link: 'https://github.com/OpenStag/Project-3',
    live_demo: '',
    technologies: ['HTML', 'CSS', 'Java Script'],
    category: 'web',
    status: 'completed',
    team_members: ['Supasana', 'Janitha', 'Nisansala','Lochana'],
    completion_date: '2025-07-13',
    featured: false
  },
  {
    id: '6',
    name: 'Coffee Shop Website',
    description: 'A cozy coffee shop website with online ordering, menu display, and customer reviews.',
    image: '/coffeshop.png',
    github_link: 'https://github.com/OpenStag/Project-2',
    live_demo: '',
    technologies: ['HTML', 'CSS', 'Java Script'],
    category: 'web',
    status: 'in-progress',
    team_members: ['Achintha', 'Pasindu', 'Tharindu Thilakshana'],
    completion_date: '2025-07-09',
    featured: false
  },
]

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'web' | 'design' | 'mobile'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProjects = projectsData.filter(project => {
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const featuredProjects = projectsData.filter(project => project.featured)
  const completedProjects = projectsData.filter(project => project.status === 'completed')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gray-50 dark:bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Our <span className="text-blue-600">Projects</span>
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Explore the innovative projects built by our talented development teams. From web applications to mobile apps and design systems.
            </p>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 lg:p-6">
                <div className="text-2xl lg:text-3xl font-bold text-yellow-400 mb-2">15+</div>
                <div className="text-sm lg:text-base text-blue-100">Total Projects</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 lg:p-6">
                <div className="text-2xl lg:text-3xl font-bold text-green-400 mb-2">15+</div>
                <div className="text-sm lg:text-base text-blue-100">Completed</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 lg:p-6">
                <div className="text-2xl lg:text-3xl font-bold text-orange-400 mb-2">10+</div>
                <div className="text-sm lg:text-base text-blue-100">Technologies</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search 
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Filter Buttons 
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Projects', icon: '🎯' },
                { key: 'web', label: 'Website', icon: '🌐' },
                { key: 'mobile', label: 'Web Application', icon: '📱' },
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedCategory(filter.key as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === filter.key
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{filter.icon}</span>
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Search Bar 
            <div className="relative w-full lg:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search projects or technologies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div> */}

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                {/* Project Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.name}
                    width={600}
                    height={400}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Project Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      {project.category === 'web' && '🌐'}
                      {project.category === 'mobile' && '📱'}
                      {project.category === 'design' && '🎨'}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Technologies */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.slice(0, 4).map((tech, index) => (
                        <span key={index} className={`px-2 py-1 text-xs rounded border-1 font-medium text-white bg-black`}>
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-medium">
                          +{project.technologies.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Team Members */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Team:</p>
                    <div className="flex flex-wrap gap-1">
                      {project.team_members.map((member, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {member}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Project Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      {formatDate(project.completion_date)}
                    </div>
                    <div className="flex gap-2">
                      {project.live_demo && (
                        <a
                          href={project.live_demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                          </svg>
                          Demo
                        </a>
                      )}
                      <a
                        href={project.github_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                        </svg>
                        Code
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
