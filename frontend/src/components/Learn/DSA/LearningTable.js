import { Check, FileText, Youtube, Code, PenTool, Star } from "lucide-react"

const LessonTable = ({ lessons }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              Article
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              YouTube
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              Practice
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              Note
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              Difficulty
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              Revision
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {lessons.map((lesson, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                {lesson.completed && (
                  <div className="flex items-center justify-center">
                    <div className="bg-green-100 text-green-800 rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{lesson.title}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {lesson.article && (
                  <div className="flex justify-center">
                    <FileText className="w-5 h-5 text-gray-500" />
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {lesson.youtube && (
                  <div className="flex justify-center">
                    <Youtube className="w-5 h-5 text-red-500" />
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {lesson.practice && (
                  <div className="flex justify-center">
                    <Code className="w-5 h-5 text-green-500" />
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {lesson.note && (
                  <div className="flex justify-center">
                    <PenTool className="w-5 h-5 text-gray-500" />
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex justify-center">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      lesson.difficulty === "Easy"
                        ? "bg-green-100 text-green-800"
                        : lesson.difficulty === "Medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {lesson.difficulty}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex justify-center">
                  <Star className="w-5 h-5 text-gray-300 hover:text-yellow-400 cursor-pointer" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default LessonTable

