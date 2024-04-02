import React, {useEffect, useState} from 'react';
import {useConfirm} from 'material-ui-confirm';
import Select from 'react-select';
import {success} from '@pnotify/core';
import Switch from 'react-switch';
import {addDays, addMinutes, format, getDay} from 'date-fns';

import {deleteSubGroup, getSubGroups} from '../../helpers/subgroup/subgroup';
import styles from '../../styles/teacher.module.scss';
import tableStyles from '../../styles/table.module.scss';
import FormInput from '../../components/FormInput/FormInput';
import {getCourses} from '../../helpers/course/course';
import ChangeSubGroup from '../../components/modals/ChangeSubGroup/ChangeSubGroup';
import {getSlots} from '../../helpers/teacher/slots';

export default function SubGroupPage() {
  const [subGroups, setSubGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const confirm = useConfirm();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [render, setRender] = useState(false);
  const [isOneDay, setIsOneDay] = useState(false);
  const [selectedWeekDay, setSelectedWeekDay] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchData = async (query = '') => {
    try {
      const data = await getSubGroups(query);
      setSubGroups(data.data);
    } catch (e) {
      // error('Something went wrong');
      console.log(e);
    }
  };
  const fetchCourses = async () => {
    try {
      const courses = await getCourses();
      setCourses(
        courses.data.map(el => {
          return {label: el.name, value: el.id};
        })
      );
    } catch (e) {
      // error('Something went wrong');
      console.log(e);
    }
  };
  useEffect(() => {
    //first time render
    fetchData('');
    fetchCourses();
  }, []);
  const generateTimeSlots = () => {
    const startTime = new Date().setHours(9, 0, 0, 0);
    const endTime = new Date().setHours(20, 30, 0, 0);

    const timeSlots = [];
    let currentTime = startTime;

    while (currentTime <= endTime) {
      timeSlots.push({
        time: format(currentTime, 'HH:mm'),
        names: []
      });
      currentTime = addMinutes(currentTime, 30);
    }

    return timeSlots;
  };
  const [scheduleTable, setScheduleTable] = useState(generateTimeSlots());
  const fetchSubGroupsByTime = async () => {
    setScheduleTable(generateTimeSlots());
    const data = await getSlots(
      `type&weekDay=${selectedWeekDay}&endSubGroup=${format(currentDate, 'yyyy-MM-dd')}`
    );
    setScheduleTable(prevSchedule => {
      const newSchedule = [...prevSchedule];
      data.data.forEach(el => {
        const timeIndex = newSchedule.findIndex(slot => slot.time === el.time);
        if (timeIndex !== -1) {
          newSchedule[timeIndex].names.push(el.SubGroup.name);
        }
      });
      return newSchedule;
    });
  };

  useEffect(() => {
    if (isOneDay) fetchSubGroupsByTime();
  }, [isOneDay, selectedWeekDay]);

  useEffect(() => {
    if (render) {
      fetchData('');
      setRender(false);
    }
  }, [render, isOneDay]);
  useEffect(() => {
    fetchData(selectedCourse !== null ? `CourseId=${selectedCourse}` : '');
  }, [selectedCourse]);

  const handleDelete = async (id, name) => {
    confirm({
      description: 'Are you sure you want to delete ' + name,
      confirmationText: 'delete',
      confirmationButtonProps: {autoFocus: true}
    })
      .then(async () => {
        await deleteSubGroup(id);
        setSubGroups(prevSubGroups => prevSubGroups.filter(subgroup => subgroup.id !== id));
        success({delay: 1000, text: 'Deleted successfully!'});
      })
      .catch(e => console.log('no ' + e));
  };

  const filteredSubGroups = subGroups.filter(element =>
    element.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDateChange = daysToAdd => {
    const newDate = addDays(currentDate, daysToAdd);
    setCurrentDate(newDate);
    // Reset selectedWeekDay to null when changing the date
    setSelectedWeekDay(getDay(newDate) - 1 < 0 ? 6 : getDay(newDate) - 1);
  };
  const formatDate = date => {
    return format(date, 'iiii, dd.MM');
  };

  return (
    <div>
      <div>
        <div className={`${styles.filter_wrapper} ${styles.filter_wrapper__available}`}>
          <Select
            className={`${styles.selector} ${styles.selector__filtering} ${styles.filter_wrapper__available__item}`}
            options={courses}
            placeholder={'Course'}
            onChange={el => setSelectedCourse(el?.value || null)}
            isDisabled={isOneDay}
            isClearable></Select>
          <div className={`${styles.filter_wrapper__available__item} ${styles.name_long}`}>
            <FormInput
              type="text"
              placeholder="Name..."
              height={'52px'}
              disabled={isOneDay}
              value={searchQuery}
              handler={setSearchQuery}
            />
          </div>
          <div className={`${styles.one_day_wrapper} ${styles.filter_wrapper__available__item}`}>
            <label>
              <span className={styles.date_selector}>One day</span>
            </label>
            <Switch
              className={styles.remove_svg_switch}
              trackColor={{true: 'red', false: 'grey'}}
              onChange={() => {
                setIsOneDay(!isOneDay);
              }}
              checked={isOneDay}
            />
          </div>
        </div>

        {!isOneDay ? (
          <div
            className={`${tableStyles.calendar} ${tableStyles.scroller} ${tableStyles.calendar__small}`}>
            {/* <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={`${styles.columns} ${styles.sticky} ${styles.cell}`}>Name</th>
                  <th className={`${styles.columns} ${styles.sticky} ${styles.cell}`}>Action</th>
                </tr>
              </thead></table */}

            <table className={tableStyles.tableBody}>
              <tbody>
                {
                  // loader ? (
                  //   <tr>
                  //     <td colSpan={2} className={`${styles.cell} ${styles.subgroup_cell}`}>
                  //       Loading...
                  //     </td>
                  //   </tr>
                  // ) :
                  filteredSubGroups.length === 0 ? (
                    <tr>
                      <td
                        colSpan={2}
                        className={`${tableStyles.cell} ${tableStyles.black_borders} ${tableStyles.cell__outer}`}>
                        Ops, can't find this SubGroup...
                      </td>
                    </tr>
                  ) : (
                    filteredSubGroups.map(element => {
                      return (
                        <tr key={element.id}>
                          <td className={tableStyles.cell__big}>
                            <div
                              className={`${tableStyles.cell} ${tableStyles.black_borders} ${tableStyles.cell__outer} ${tableStyles.cell__outer__big}`}>
                              {element.name}
                            </div>
                          </td>
                          <td>
                            <div
                              className={`${tableStyles.cell} ${tableStyles.black_borders} ${tableStyles.cell__outer} ${styles.action_wrapper}`}>
                              <button
                                className={`${styles.button} ${styles.button__edit} ${styles.button__edit__small}`}
                                onClick={() => {
                                  setIsOpen(!isOpen);
                                  setSelectedId(element.id);
                                }}>
                                Edit
                              </button>
                              <button
                                className={`${styles.button} ${styles.button__delete} ${styles.button__delete__small}`}
                                onClick={() => handleDelete(element.id, element.name)}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )
                }
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <div className={`${styles.date_selector} ${styles.available_nav__item}`}>
              <button onClick={() => handleDateChange(-1)} className={styles.week_selector}>
                {'<'}
              </button>
              <span>{formatDate(currentDate)}</span>
              <button onClick={() => handleDateChange(1)} className={styles.week_selector}>
                {'>'}
              </button>
            </div>
            <div
              className={`${tableStyles.calendar} ${tableStyles.calendar__small} ${tableStyles.scroller}`}>
              <table className={tableStyles.tableBody}>
                <tbody>
                  {scheduleTable.map(({time, names}) => (
                    <tr key={time}>
                      <td className={tableStyles.cell__available}>
                        <div
                          className={`${tableStyles.cell} ${tableStyles.black_borders} ${tableStyles.cell__outer}`}>
                          {time}
                        </div>
                      </td>
                      <td className={tableStyles.cell__big}>
                        <div
                          className={`${tableStyles.cell} ${tableStyles.black_borders} ${tableStyles.cell__outer}`}>
                          {names.join(', ')}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <ChangeSubGroup
          isOpen={isOpen}
          handleClose={() => setIsOpen(!isOpen)}
          setRender={setRender}
          id={selectedId}></ChangeSubGroup>
      </div>
    </div>
  );
}
