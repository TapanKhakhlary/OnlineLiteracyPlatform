import { useState, useEffect } from 'react';
import { Box, SimpleGrid, Heading, Spinner } from '@chakra-ui/react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import CourseCard from '../../components/CourseCard';

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "courses"));
        const coursesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <Spinner size="xl" />;

  return (
    <Box p={8}>
      <Heading mb={8} textAlign="center">Available Courses</Heading>
      <SimpleGrid columns={[1, 2, 3]} spacing={10}>
        {courses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </SimpleGrid>
    </Box>
  );
}