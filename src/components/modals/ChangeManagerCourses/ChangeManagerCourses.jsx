import styles from './ChangeManagerCourses.module.scss';
import teacherStyles from '../../../styles/teacher.module.scss';
import Modal from '../../Modal/Modal';
import React, {useState, useEffect} from 'react';
import Switch from 'react-switch';
import {
  getCourses,
  getTeacherCourses,
  postTeacherCourse,
  deleteTeacherCourse
} from '../../../helpers/course/course';
import {useDispatch, useSelector} from 'react-redux';
import {
  addTeacherCourses,
  setCourses,
  setTeacherCourses,
  updateTeacherCourse
} from '../../../redux/action/course.action';

const ChangeManagerCourses = ({
  isOpen,
  handleClose,
  teacherId,
  filteringCourses,
  setFilteringCourses,
  forFilters = false
}) => {
  const dispatch = useDispatch();
  const courses = useSelector(state => state.courses.courses);
  const teacherCourses = useSelector(state => state.courses.teacherCourses) || [];
  useEffect(() => {
    const fetchAllCourses = async () => {
      if (!forFilters) {
        const teachersCrs = await getTeacherCourses(teacherId);
        dispatch(setTeacherCourses(teachersCrs.data));
      }
    };
    fetchAllCourses();
  }, [teacherId, dispatch]);

  const handleCheckboxChange = async (courseId, id) => {
    if (!forFilters) {
      if (teacherCourses.some(el => el.id === courseId)) {
        await deleteTeacherCourse(id, courseId);
        dispatch(setTeacherCourses(teacherCourses.filter(el => el.id !== courseId)));
      } else {
        await postTeacherCourse(id, courseId);
        const newTeacherCourses = courses.filter(el => el.id === courseId)[0];
        dispatch(addTeacherCourses(newTeacherCourses));
      }
    } else {
      setFilteringCourses(prevCourses => {
        if (prevCourses.includes(courseId)) {
          return prevCourses.filter(el => el !== courseId);
        } else {
          return [...prevCourses, courseId];
        }
      });
    }
  };
  if (forFilters && !isOpen) return <></>;
  return (
    <>
      <Modal open={isOpen} onClose={handleClose}>
        <h1 className={styles.title}>Teacher courses</h1>
        <h3 className={styles.managerLinkTitle}>
          {forFilters
            ? `Pick courses for filtering, and close this window
          to apply changes:`
            : 'Choose courses'}
          {/* Teacher :TODO: make href */}
          {/* <a className={styles.managerLink} href={`/user/${managerInfo.id}/planning`}>
            {managerInfo.name}
          </a> */}
        </h3>
        <div className={styles.coursesBox}>
          {courses.length > 0 &&
            courses.map(course => {
              const teacherCourse = (teacherCourses || []).filter(
                el => el.courseId === course.id
              )[0];
              console.log(teacherCourses);
              if (teacherCourse) {
                teacherCourse.courseId = 69;
                dispatch(updateTeacherCourse(teacherCourse));
              }
              return (
                <div key={course.id} className={styles.checkBoxDiv}>
                  <div className={styles.checkBoxLabel}>
                    <input
                      className={styles.checkBox}
                      type="checkbox"
                      key={Math.random() * 100000 - 10}
                      checked={
                        !forFilters
                          ? teacherCourse && teacherCourse.courseId
                          : (filteringCourses || []).length > 0 &&
                            filteringCourses.some(el => {
                              return el === course.id;
                            })
                      }
                      onChange={() => handleCheckboxChange(course.id, teacherId)}
                    />
                    {course.name}
                  </div>
                  {!forFilters &&
                    teacherCourses.some(el => {
                      return el.courseId === course.id;
                    }) && (
                      <div className={styles.switch_wrapper}>
                        <Switch
                          className={teacherStyles.remove_svg_switch}
                          onChange={e => {}}></Switch>
                        <span className={teacherStyles.switch_label}>tech</span>
                      </div>
                    )}
                </div>
              );
            })}
        </div>
        {/* <button className={styles.input__submit} onClick={handleSave}>
          Save
        </button> */}
      </Modal>
    </>
  );
};

export default ChangeManagerCourses;
