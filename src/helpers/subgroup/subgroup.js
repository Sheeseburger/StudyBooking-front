import axios from '../axios-config';

axios.create({
  withCredentials: true
});

const postSubGroup = credentials => {
  console.log(credentials);
  const data = {};
  try {
    data.link = credentials.link;
    data.name = credentials.subGroup;
    data.description = credentials.description;
    data.adminId = credentials.selectedAdmin;
    data.CourseId = credentials.selectedCourse;
    data.startDate = new Date(credentials.startDate);
    data.endDate = new Date(credentials.endDate);
  } catch (error) {}
  console.log(data);
  return axios
    .post('/subgroups', data)
    .then(res => res.data)
    .catch(error => {
      throw error;
    });
};

const getSlotDetails = id => {
  return axios
    .get(`/subgroups/${id}`)
    .then(res => res.data)
    .catch(error => {
      throw error;
    });
};

export {postSubGroup, getSlotDetails};