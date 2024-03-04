import React, {useState, useEffect} from 'react';
import styles from '../../styles/SuperAdminPage.module.scss';
import NewUser from '../../components/modals/NewUser/NewUser';
import {getRoles, getUsers} from '../../helpers/user/user';
// import { getManagers } from "../../helpers/manager/manager";
import {useSelector} from 'react-redux';
import {Fade} from 'react-awesome-reveal';
import {Link} from 'react-router-dom';
import FormInput from '../../components/FormInput/FormInput';
import ChangeManagerCourses from '../../components/modals/ChangeManagerCourses/ChangeManagerCourses';

export default function UsersPage() {
  const [isOpen, setIsOpen] = useState(false);
  const userRole = useSelector(state => state.auth.user.role);
  const [title, setTitle] = useState('New User');
  const [admins, setAdmins] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [name, setName] = useState('');
  const [role, setRole] = useState(0);
  const [rating, setRating] = useState(0);
  const [email, setEmail] = useState('');
  const [edit, setEdit] = useState(false);
  const [id, setId] = useState(0);
  const [needToRender, SetNeedToRender] = useState(true);
  const [filterName, setFilterName] = useState('');
  const [coursesModal, setCoursesModal] = useState(false);
  const [filterCourses, setFilterCourses] = useState([]);
  const [prevFilterCourses, setPrevFilterCourses] = useState(filterCourses);
  const [debounceTimer, setDebounceTimer] = useState();
  const [superAdmins, setSuperAdmins] = useState([]);
  const fetchAdmins = async () => {
    try {
      const res = await getUsers(`role=administrator`);

      setAdmins(res.data);
    } catch (error) {}
  };

  const fetchSuperAdmins = async () => {
    try {
      const res = await getUsers(`role=superAdmin`);
      setSuperAdmins(res.data);
    } catch (error) {}
  };
  const fetchTeachers = async () => {
    try {
      const res = await getUsers(
        // teachersFilter - flag for corner case on backend
        `role=teacher${filterName || filterCourses.length > 0 ? '&teachersFilter=true' : ''}${
          filterName ? '&name=' + filterName : ''
        }${filterCourses.length > 0 ? '&courses=' + JSON.stringify(filterCourses) : ''}`
      );

      setTeachers(res.data);
    } catch (error) {}
  };

  const handleClose = () => {
    setIsOpen(!isOpen);
  };

  const [renderTeachers, setRenderTeachers] = useState(false);
  const handleFilterNameChange = value => {
    setFilterName(value);

    clearTimeout(debounceTimer);
    const newDebounceTimer = setTimeout(() => {
      setRenderTeachers(true);
    }, 500);
    setDebounceTimer(newDebounceTimer);
  };

  useEffect(() => {
    fetchAdmins();
    fetchTeachers();
    fetchSuperAdmins();
    SetNeedToRender(false);
  }, [needToRender]);

  useEffect(() => {
    fetchTeachers();
    setRenderTeachers(false);
  }, [renderTeachers]);

  useEffect(() => {
    if (coursesModal) {
      // before open modal window
      console.log('open');
      setPrevFilterCourses(filterCourses);
    }
    if (!coursesModal) {
      // after closing modal window
      if (JSON.stringify(prevFilterCourses) !== JSON.stringify(filterCourses)) {
        setRenderTeachers(true);
      }
    }
  }, [coursesModal]);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    try {
      const fetchRoles = async () => {
        const res = await getRoles();

        setRoles(
          (res?.data || []).map(el => {
            return {label: el.name, value: el.id};
          })
        );
        if (userRole !== 'superAdmin') {
          setRoles(prev => prev.filter(el => el.label !== 'superAdmin'));
        }
      };
      fetchRoles();
    } catch (error) {}
  }, []);
  return (
    <>
      <div className={styles.main_wrapper}>
        <h3 className={styles.main_title}>Manage users.</h3>
        {['administrator', 'superAdmin'].includes(userRole) && (
          <div className={styles.new_user}>
            <div className={styles.btn_wrapper}>
              <button
                className={styles.add_btn}
                data-modal="new-user"
                onClick={() => {
                  setIsOpen(!isOpen);
                  setTitle('New User');
                  setEdit(false);
                }}>
                Add new user
              </button>
              <NewUser
                isOpen={isOpen}
                handleClose={() => handleClose()}
                isAdmin={false}
                SetNeedToRender={SetNeedToRender}
                title={title}
                name={name}
                role={role}
                email={email}
                rating={rating}
                edit={edit}
                id={id}
                roles={roles}
              />
            </div>
          </div>
        )}
        <div className={styles.main_wrapper2}>
          <div className={styles.wrapper} key={'index0'}>
            <React.Fragment key={1}>
              <div key={'index'}>
                <p className={styles.mini_title}>Супер адміністратор</p>

                <ul className={styles.main_wrapper}>
                  {(superAdmins || []).map(item => {
                    return (
                      <Fade cascade triggerOnce duration={300} direction="up" key={item.id}>
                        <li className={styles.ul_items} key={item.name}>
                          <Link className={styles.ul_items_link} target="_self" to={'#'}>
                            {' '}
                            <p className={styles.ul_items_text}>
                              {item.name} ({item.id})
                            </p>
                            {userRole === 'superAdmin' && (
                              <button
                                className={styles.ul_items_btn}
                                // data-modal="change-user"
                                onClick={() => {
                                  setIsOpen(!isOpen);
                                  setTitle(`Edit ${item.name}`);
                                  setName(item.name);
                                  setRole(item.RoleId);
                                  setEmail(item.email);
                                  setRating(item.rating);
                                  setId(item.id);
                                  setEdit(true);
                                }}
                              />
                            )}
                          </Link>
                        </li>
                      </Fade>
                    );
                  })}
                </ul>
              </div>
            </React.Fragment>
          </div>
          <div className={styles.wrapper} key={'index1'}>
            <React.Fragment key={1}>
              <div key={'index'}>
                <p className={styles.mini_title}>Призначення</p>

                <ul className={styles.main_wrapper}>
                  {(admins || []).map(item => {
                    return (
                      <Fade cascade triggerOnce duration={300} direction="up" key={item.id}>
                        <li className={styles.ul_items} key={item.name}>
                          <Link className={styles.ul_items_link} target="_self" to={'#'}>
                            <p className={styles.ul_items_text}>
                              {item.name} ({item.id})
                            </p>

                            {userRole === 'superAdmin' && (
                              <button
                                className={styles.ul_items_btn}
                                // data-modal="change-user"
                                onClick={() => {
                                  setIsOpen(!isOpen);
                                  setTitle(`Edit ${item.name}`);
                                  setName(item.name);
                                  setRole(item.RoleId);
                                  setEmail(item.email);
                                  setRating(item.rating);
                                  setId(item.id);
                                  setEdit(true);
                                }}
                              />
                            )}
                          </Link>
                        </li>
                      </Fade>
                    );
                  })}
                </ul>
              </div>
            </React.Fragment>
          </div>
          <React.Fragment key={2}>
            <div className={styles.wrapper} key={'index1'}>
              <p className={styles.mini_title}>Ментори</p>

              <ul className={`${styles.main_wrapper} ${styles.filter_wrapper}`}>
                <li className={styles.ul_items}>
                  <Fade
                    style={{marginBottom: '10px'}}
                    cascade
                    triggerOnce
                    duration={300}
                    direction="up"
                    key={`item.id`}>
                    <FormInput
                      type={'text'}
                      placeholder={`Ім'я`}
                      value={filterName}
                      handler={handleFilterNameChange}></FormInput>
                    <FormInput
                      value={'Курси'}
                      type={'button'}
                      classname={styles.courses_filter}
                      handler={() => {
                        setCoursesModal(!coursesModal);
                      }}
                      alignValue={true}></FormInput>
                  </Fade>
                </li>
                {(teachers || []).map(item => {
                  return (
                    <Fade cascade triggerOnce duration={300} direction="up" key={item.id}>
                      <li className={styles.ul_items} key={item.name}>
                        <Link
                          className={styles.ul_items_link}
                          target="_self"
                          to={`../teacher/${item.id}`}>
                          <p className={styles.ul_items_text}>
                            {item.name} ({item.id})
                          </p>
                        </Link>
                        <button
                          className={styles.ul_items_btn}
                          // data-modal="change-user"
                          onClick={() => {
                            console.log(item);
                            setIsOpen(!isOpen);
                            setTitle(`Edit ${item.name}`);
                            setName(item.name);
                            setRole(item.RoleId);
                            setEmail(item.email);
                            setRating(item.rating);
                            setId(item.id);
                            setEdit(true);
                          }}
                        />
                      </li>
                    </Fade>
                  );
                })}
              </ul>
            </div>
          </React.Fragment>
        </div>
      </div>

      <ChangeManagerCourses
        isOpen={coursesModal}
        filteringCourses={filterCourses}
        setFilteringCourses={setFilterCourses}
        forFilters={true}
        handleClose={() => {
          setCoursesModal(!coursesModal);
        }}></ChangeManagerCourses>
    </>
  );
}
