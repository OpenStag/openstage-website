import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                OpenStage
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
              A non-profit organization built by passionate individuals to provide real-world IT project experience 
              to students and young professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/about"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              >
                Learn About Our Mission
              </Link>
              <Link
                href="/contact"
                className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
              >
                Get Involved
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-200 rounded-full opacity-50"></div>
          <div className="absolute top-1/2 -left-10 w-32 h-32 bg-indigo-200 rounded-full opacity-50"></div>
          <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-blue-300 rounded-full opacity-50"></div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We bridge the gap between academic learning and professional experience by providing 
              real-world project opportunities in a collaborative environment.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-World Learning</h3>
              <p className="text-gray-600">
                Hands-on experience with actual projects that make a difference in the tech community.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Collaborative Environment</h3>
              <p className="text-gray-600">
                Work alongside passionate individuals and experienced mentors in a supportive community.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Professional Growth</h3>
              <p className="text-gray-600">
                Build valuable skills, expand your network, and prepare for a successful tech career.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Showcase */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Amazing Projects
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              See what our talented team has accomplished through collaboration, learning, and passion.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">OpenStage Website</h3>
                <p className="text-gray-600 mb-4">
                  Our official website built with Next.js, showcasing our mission and connecting with the community.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">Next.js</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">TypeScript</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">Tailwind CSS</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-green-400 to-green-600"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Student Management System</h3>
                <p className="text-gray-600 mb-4">
                  A comprehensive platform for educational institutions to manage student data and academic records.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">React</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Node.js</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">PostgreSQL</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Event Platform</h3>
                <p className="text-gray-600 mb-4">
                  An event management system helping local communities organize and promote their activities.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">Vue.js</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">Express</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">MongoDB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Updates */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Recent Updates
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Stay up to date with our latest achievements and community involvement.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="border-l-4 border-blue-500 pl-6 py-4">
              <div className="text-sm text-gray-500 mb-2">January 2025</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                New Student Mentorship Program Launched
              </h3>
              <p className="text-gray-600">
                We've expanded our reach with a dedicated mentorship program connecting experienced professionals 
                with aspiring developers. Over 50 students have already joined our community!
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-6 py-4">
              <div className="text-sm text-gray-500 mb-2">December 2024</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Community Event Platform Goes Live
              </h3>
              <p className="text-gray-600">
                Our team successfully deployed a full-stack event management platform, now being used by 
                three local communities to organize their events and activities.
              </p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-6 py-4">
              <div className="text-sm text-gray-500 mb-2">November 2024</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                OpenStage Foundation Established
              </h3>
              <p className="text-gray-600">
                Officially registered as a non-profit organization with a mission to bridge the gap between 
                academic learning and real-world professional experience in the tech industry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join our community of passionate individuals working together to create meaningful projects 
            and provide valuable learning experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/contact"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Volunteer With Us
            </Link>
            <Link
              href="/about"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Become a Mentor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
