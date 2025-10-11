import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button, Loading, Textbox } from "../components";
import { useRegisterMutation } from "../redux/slices/api/authApiSlice";
import { setCredentials } from "../redux/slices/authSlice";
import { useEffect } from "react";

const Register = () => {
  const { user } = useSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [registerUser, { isLoading }] = useRegisterMutation();

  const handleRegister = async (data) => {
    try {
      const res = await registerUser(data).unwrap();
      dispatch(setCredentials(res));
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Registration failed. Please try again.');
    }
  };

  useEffect(() => {
    user && navigate("/dashboard");
  }, [user]);

  return (
    <div className='w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-[#f3f4f6] dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#302943] via-slate-900 to-black'>
      <div className='w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center'>
        <div className='h-full w-full lg:w-2/3 flex flex-col items-center justify-center'>
          <div className='w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10 2xl:-mt-20'>
            <span className='flex gap-1 py-1 px-3 border rounded-full text-sm md:text-base dark:border-gray-700 dark:text-blue-400 border-gray-300 text-gray-600'>
              Manage all your task in one place!
            </span>
            <p className='flex flex-col gap-0 md:gap-4 text-4xl md:text-6xl 2xl:text-7xl font-black text-center dark:text-gray-400 text-blue-700'>
              <span>Cloud-based</span>
              <span>Task Manager</span>
            </p>

            <div className='cell'>
              <div className='circle rotate-in-up-left'></div>
            </div>
          </div>
        </div>

        <div className='w-full md:w-1/3 p-4 md:p-1 flex flex-col justify-center items-center'>
          <form
            onSubmit={handleSubmit(handleRegister)}
            className='form-container w-full md:w-[400px] flex flex-col gap-y-8 bg-white dark:bg-slate-900 px-10 pt-14 pb-14'
          >
            <div>
              <p className='text-blue-600 text-3xl font-bold text-center'>
                Create Account
              </p>
              <p className='text-center text-base text-gray-700 dark:text-gray-500'>
                Join us to manage your tasks!
              </p>
            </div>
            <div className='flex flex-col gap-y-5'>
              <Textbox
                placeholder='John Doe'
                type='text'
                name='name'
                label='Full Name'
                className='w-full rounded-full'
                register={register("name", {
                  required: "Full Name is required!",
                })}
                error={errors.name ? errors.name.message : ""}
              />
              <Textbox
                placeholder='you@example.com'
                type='email'
                name='email'
                label='Email Address'
                className='w-full rounded-full'
                register={register("email", {
                  required: "Email Address is required!",
                })}
                error={errors.email ? errors.email.message : ""}
              />
              <Textbox
                placeholder='password'
                type='password'
                name='password'
                label='Password'
                className='w-full rounded-full'
                register={register("password", {
                  required: "Password is required!",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters"
                  }
                })}
                error={errors.password ? errors.password?.message : ""}
              />
              <Textbox
                placeholder='Job Title'
                type='text'
                name='title'
                label='Job Title'
                className='w-full rounded-full'
                register={register("title", {
                  required: "Job Title is required!",
                })}
                error={errors.title ? errors.title.message : ""}
              />
              <Textbox
                placeholder='Team/Department'
                type='text'
                name='role'
                label='Role'
                className='w-full rounded-full'
                register={register("role", {
                  required: "Role is required!",
                })}
                error={errors.role ? errors.role.message : ""}
              />
            </div>
            {isLoading ? (
              <Loading />
            ) : (
              <Button
                type='submit'
                label='Create Account'
                className='w-full h-10 bg-blue-700 text-white rounded-full'
              />
            )}
            <div className='text-center'>
              <span className='text-sm text-gray-600'>
                Already have an account?{' '}
                <Link to='/log-in' className='text-blue-600 hover:underline'>
                  Sign in
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;