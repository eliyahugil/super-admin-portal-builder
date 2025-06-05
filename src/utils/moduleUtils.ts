
// Re-export all functions and types for backward compatibility
export type {
  SimpleProfile,
  SimpleBusiness,
  SimpleModule,
  CustomField,
  SubModule,
  ModuleCreationResult,
  ModuleRouteInfo,
  ValidationResult
} from './moduleTypes';

export { validateModuleName } from './moduleValidation';

export {
  moduleRouteMapping,
  parseModuleRoute
} from './moduleRouting';

export {
  generateTableName,
  generateRoute,
  generateIcon
} from './moduleGeneration';

export {
  getCustomerNumberForUser,
  isSuperAdmin,
  getUserBusinessId,
  createCustomModuleWithTable,
  createSubModules,
  addModuleToBusiness
} from './moduleDatabase';

export { cleanupModuleData } from './moduleCleanup';
