import { useState, useEffect } from 'react';
import { 
  Flex, 
  Heading, 
  Tab, 
  TabList, 
  TabPanel, 
  TabPanels, 
  Tabs 
} from '@chakra-ui/react';
import TeacherCourses from './Courses';
import TeacherStudents from './Students';
import Availability from './Availability';

export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState(null);

  useEffect(() => {
    const fetchTeacherData = async () => {
      // Get current user ID from auth
      const userId = auth.currentUser?.uid;
      const response = await axios.get(`/api/teachers/${userId}`);
      setTeacher(response.data);
    };
    fetchTeacherData();
  }, []);

  return (
    <Flex direction="column" p={8}>
      <Heading mb={6}>Teacher Dashboard</Heading>
      
      <Tabs variant="enclosed">
        <TabList>
          <Tab>My Courses</Tab>
          <Tab>Students</Tab>
          <Tab>Availability</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <TeacherCourses courses={teacher?.courses} />
          </TabPanel>
          <TabPanel>
            <TeacherStudents students={teacher?.students} />
          </TabPanel>
          <TabPanel>
            <Availability 
              currentAvailability={teacher?.availability} 
              onUpdate={handleUpdateAvailability}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
}