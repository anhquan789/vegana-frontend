import AppLayout from '../../components/layout/AppLayout';
import Banner from './Banner';
import CourseList from './CourseList';
import Header from './Header';

const HomePage = () => {
  return (
    <AppLayout>
      <Header />
      <Banner />
      <CourseList />
    </AppLayout>
  );
};

export default HomePage;
