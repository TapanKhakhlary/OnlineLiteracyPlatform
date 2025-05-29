import { SimpleGrid, Box, Button } from '@chakra-ui/react';
import CourseCard from '../../components/CourseCard';
import AddCourseModal from './AddCourseModal';

export default function TeacherCourses({ courses }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Box>
      <Button mb={4} onClick={() => setIsModalOpen(true)}>
        Add New Course
      </Button>

      <SimpleGrid columns={[1, 2, 3]} spacing={6}>
        {courses?.map(course => (
          <CourseCard 
            key={course.id} 
            course={course} 
            isTeacher={true}
          />
        ))}
      </SimpleGrid>

      <AddCourseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
      />
    </Box>
  );
}