const isProductionEnv = (): boolean => process.env.NODE_ENV === "production";

export default isProductionEnv;
