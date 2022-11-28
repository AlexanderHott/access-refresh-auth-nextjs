import { zodResolver } from "@hookform/resolvers/zod";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import {
  FormProvider,
  type SubmitHandler,
  useForm,
  useFormContext,
} from "react-hook-form";
import { object, string, type TypeOf } from "zod";
import { trpc } from "../utils/trpc";

const loginSchema = object({
  email: string()
    .min(1, "Email address is required")
    .email("Email Address is invalid"),
  password: string()
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
});

export type LoginInput = TypeOf<typeof loginSchema>;
const FormInput: React.FC<{
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
}> = ({ label, name, type, defaultValue }) => {
  const methods = useFormContext();
  return (
    <div className="flex flex-col">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        type={type}
        defaultValue={defaultValue}
        {...methods.register(name)}
        className="rounded-md border border-gray-300 p-2"
      />
    </div>
  );
};

const LoginPage = () => {
  const router = useRouter();
  // const store = useStore();

  // const query = trpc.user.getMe.useQuery();
  // const query = trpc.useQuery(["users.me"], {
  //   enabled: false,
  //   onSuccess: (data) => {
  //     // store.setAuthUser(data.data.user as IUser);
  //     console.log(data);
  //   },
  // });

  const loginUser = trpc.auth.loginUser.useMutation({
    onSuccess(data) {
      console.log("success", data);
      // query.refetch();
      router.push("/");
    },
    onError(error) {
      console.log("error", error);
    },
  });
  // const { isLoading, mutate: loginUser } = trpc.useMutation(["auth.login"], {
  //   onSuccess(data) {
  //     toast("Logged in successfully", {
  //       type: "success",
  //       position: "top-right",
  //     });
  //     query.refetch();
  //     router.push("/");
  //   },
  //   onError(error) {
  //     toast(error.message, {
  //       type: "error",
  //       position: "top-right",
  //     });
  //   },
  // });

  const methods = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitSuccessful },
  } = methods;

  useEffect(() => {
    if (isSubmitSuccessful) {
      // reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitSuccessful]);

  const onSubmitHandler: SubmitHandler<LoginInput> = (values) => {
    // 👇 Executing the loginUser Mutation
    console.log("onSubmitHandler", values);
    loginUser.mutate(values);
  };

  return (
    <section className="bg-ct-blue-600 grid min-h-screen place-items-center">
      <div className="w-full">
        <h1 className="text-ct-yellow-600 mb-4 text-center text-4xl font-[600] xl:text-6xl">
          Welcome Back
        </h1>
        <h2 className="text-ct-dark-200 mb-4 text-center text-lg">
          Login to have access
        </h2>
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmitHandler)}
            className="bg-ct-dark-200 mx-auto w-full max-w-md space-y-5 overflow-hidden rounded-2xl p-8 shadow-lg"
          >
            <FormInput label="Email" name="email" type="email" />
            <FormInput label="Password" name="password" type="password" />

            <div className="text-right">
              <Link href="#" className="">
                Forgot Password?
              </Link>
            </div>
            <button disabled={loginUser.isLoading}>Login</button>
            <span className="block">
              Need an account? <Link href="/register">Sign Up Here</Link>
            </span>
          </form>
        </FormProvider>
      </div>
    </section>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      requireAuth: false,
      enableAuth: false,
    },
  };
};

export default LoginPage;
