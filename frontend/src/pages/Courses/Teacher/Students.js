import { Table, Thead, Tbody, Tr, Th, Td, Progress } from '@chakra-ui/react';

export default function TeacherStudents({ students }) {
  return (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Student</Th>
          <Th>Course</Th>
          <Th>Progress</Th>
        </Tr>
      </Thead>
      <Tbody>
        {students?.map(student => (
          <Tr key={student.studentId}>
            <Td>{student.name}</Td>
            <Td>{student.course}</Td>
            <Td>
              <Progress 
                value={student.progress} 
                size="sm" 
                colorScheme="green"
              />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}