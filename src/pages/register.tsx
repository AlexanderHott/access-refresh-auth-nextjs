import type { GetServerSideProps, NextPage } from "next";
import { object, string, TypeOf, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  FormProvider,
  SubmitHandler,
  useFormContext,
} from "react-hook-form";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { trpc } from "../utils/trpc";
// import { toast } from "react-toastify";

const registerSchema = object({
  username: string().min(1, "Full name is required").max(100),
  email: string()
    .min(1, "Email address is required")
    .email("Email Address is invalid"),
  photo: string().min(1, "Photo is required"),
  password: string()
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
  passwordConfirm: string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.passwordConfirm, {
  path: ["passwordConfirm"],
  message: "Passwords do not match",
});

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

export type RegisterInput = TypeOf<typeof registerSchema>;

const RegisterPage: NextPage = () => {
  const router = useRouter();
  const { mutate: SignUpUser, isLoading } = trpc.auth.registerUser.useMutation({
    onSuccess(data) {
      //   toast(`Welcome ${data.data.user.name}!`, {
      //     type: "success",
      //     position: "top-right",
      //   });
      console.log(data.data.user);
      router.push("/login");
    },
    onError(error) {
      console.log(error);

      //   toast(error.message, {
      //     type: "error",
      //     position: "top-right",
      //   });
    },
  });

  const methods = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitSuccessful, errors },
  } = methods;

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitSuccessful]);

  const onSubmitHandler: SubmitHandler<RegisterInput> = (values) => {
    // 👇 Execute the Mutation
    console.log(values);
    SignUpUser(values);
  };
  return (
    <div className="bg-ct-blue-600 grid min-h-screen place-items-center py-8">
      <div className="w-full">
        <h1 className="text-ct-yellow-600 mb-4 text-center text-4xl font-[600] xl:text-6xl">
          Welcome to ACME!
        </h1>
        <h2 className="text-ct-dark-200 mb-4 text-center text-lg">
          Sign Up To Get Started!
        </h2>
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmitHandler)}
            className="bg-ct-dark-200 mx-auto w-full max-w-md space-y-5 overflow-hidden rounded-2xl p-8 shadow-lg"
          >
            <FormInput label="Full Name" name="username" />
            <FormInput label="Email" name="email" type="email" />
            <FormInput label="Password" name="password" type="password" />
            <FormInput
              label="Confirm Password"
              name="passwordConfirm"
              type="password"
            />
            <FormInput label="Photo" name="photo" defaultValue="asdf.png" />
            <span className="block">
              Already have an account? <Link href="/login">Login Here</Link>
            </span>
            <button
              className="text-ct-blue-600"
              disabled={isLoading}
              onClick={handleSubmit(onSubmitHandler)}
            >
              Sign up
            </button>
            {/* <input type="submit" /> */}
            <pre>{JSON.stringify(errors)}</pre>
          </form>
        </FormProvider>
      </div>
    </div>
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

export default RegisterPage;
