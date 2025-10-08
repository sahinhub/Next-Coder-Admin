'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Briefcase,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { type Project } from '@/lib/api'

interface PortfolioManagementProps {
  projects: Project[]
  searchTerm: string
  onSearchChange: (term: string) => void
  onAddPortfolio: () => void
  onEditPortfolio: (portfolio: Project) => void
  onDeletePortfolio: (id: string) => void
}

export function PortfolioManagement({
  projects,
  searchTerm,
  onSearchChange,
  onAddPortfolio,
  onEditPortfolio,
  onDeletePortfolio
}: PortfolioManagementProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filter data based on search term
  const filteredPortfolios = projects.filter(portfolio =>
    portfolio.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    portfolio.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (Array.isArray(portfolio.category) ? portfolio.category.some(cat => 
      cat.toLowerCase().includes(searchTerm.toLowerCase())
    ) : portfolio.category?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Pagination calculations
  const totalPages = Math.ceil(filteredPortfolios.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedPortfolios = filteredPortfolios.slice(startIndex, endIndex)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage your project portfolio</p>
        </div>
        <Button onClick={onAddPortfolio} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Portfolio</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search portfolios..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center space-x-2">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </Button>
      </div>

      {/* Portfolio Table */}
      <Card>
        <CardContent className="p-0">
          {filteredPortfolios.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No portfolios found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm ? 'No portfolios match your search criteria.' : 'Get started by creating your first portfolio project.'}
              </p>
              {!searchTerm && (
                <Button onClick={onAddPortfolio} className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Portfolio
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Project</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Updated</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedPortfolios.map((portfolio) => (
                      <tr key={portfolio._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                              {portfolio.thumbnail ? (
                                <img 
                                  src={portfolio.thumbnail} 
                                  alt={portfolio.title}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Briefcase className="w-8 h-8 text-gray-400" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{portfolio.title}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{portfolio.description?.substring(0, 60)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(portfolio.category) ? 
                              portfolio.category.slice(0, 2).map((cat, index) => (
                                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  {cat}
                                </span>
                              )) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  {portfolio.category}
                                </span>
                              )
                            }
                            {Array.isArray(portfolio.category) && portfolio.category.length > 2 && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                +{portfolio.category.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Published
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {portfolio.createdAt ? new Date(portfolio.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {portfolio.updatedAt ? new Date(portfolio.updatedAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditPortfolio(portfolio)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 p-2"
                              title="Edit portfolio"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeletePortfolio(portfolio._id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2"
                              title="Delete portfolio"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4 p-4">
                {paginatedPortfolios.map((portfolio) => (
                  <Card key={portfolio._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow duration-150">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        {portfolio.thumbnail ? (
                          <img 
                            src={portfolio.thumbnail} 
                            alt={portfolio.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Briefcase className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{portfolio.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{portfolio.description}</p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(portfolio.category) ? 
                              portfolio.category.slice(0, 2).map((cat, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  {cat}
                                </span>
                              )) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  {portfolio.category}
                                </span>
                              )
                            }
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditPortfolio(portfolio)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 p-2"
                              title="Edit portfolio"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeletePortfolio(portfolio._id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2"
                              title="Delete portfolio"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <span>
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredPortfolios.length)} of {filteredPortfolios.length} results
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex items-center"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNum 
                                ? "z-10 bg-green-50 border-green-500 text-green-600 dark:bg-green-900/20 dark:border-green-400 dark:text-green-400" 
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                            }`}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="flex items-center"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
