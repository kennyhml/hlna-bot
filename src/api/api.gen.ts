/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/**
 * The kind of association a user has with a tribe
 * @example "Admin"
 */
export enum TribeRank {
  Owner = "Owner",
  Admin = "Admin",
  Member = "Member",
  Ally = "Ally",
}

/**
 * The users system role. Controls the scopes the user is granted.
 * @example "Member"
 */
export enum UserRole {
  Admin = "Admin",
  Reseller = "Reseller",
  Customer = "Customer",
  Member = "Member",
}

/**
 * Unique identifier of a HLNA User Account
 * @example 189581928322
 */
export type UserId = number;

export interface JWTData {
  /** The access token to be included in subsequent requests. */
  access_token: string;
  /** The refresh token that can be used to renew the access token. */
  refresh_token: string;
  /** The time (in seconds) until the access token will expir. */
  expires_in: number;
  /** The type of token */
  token_type?: string;
  /** The scopes included in the token. */
  scope: string[];
}

/**
 * Discord ID (Snowflake)
 * @pattern ^[0-9]+$
 * @example "410499363476078594"
 */
export type DiscordId = string;

/**
 * The name of a user, must be unique across all members. This name, in combination with the password, will be used to obtain a JWT.
 * @minLength 3
 * @maxLength 32
 * @example "SwedishTerminator"
 */
export type UserName = string;

/**
 * The name of a tribe created by a user
 * @minLength 3
 * @maxLength 32
 * @example "TeletubbyClub"
 */
export type TribeName = string;

/** A user as the member of a tribe, including their association with the tribe. */
export interface TribeMember {
  id: number;
  /** Discord ID (Snowflake) */
  discord_id: DiscordId;
  /** The name of a user, must be unique across all members. This name, in combination with the password, will be used to obtain a JWT. */
  name: UserName;
  /** The kind of association a user has with a tribe */
  rank: TribeRank;
  /**
   * The last time this user was updated
   * @format date-time
   */
  updated?: string;
  /**
   * The time that the user joined this tribe
   * @format date-time
   */
  joined: string;
  /** The ID of the user who last updated this user */
  updated_by?: number | null;
}

/** A user created tribe that logically groups users together. */
export interface Tribe {
  id: number;
  /** The name of a tribe created by a user */
  name: TribeName;
  /** @format date-time */
  created: string;
  members?: TribeMember[];
}

/** The data of a HLNA user. Does not contain any sensitive data (e.g. passwords). */
export interface User {
  id: number;
  /** The name of a user, must be unique across all members. This name, in combination with the password, will be used to obtain a JWT. */
  name: UserName;
  /** Discord ID (Snowflake) */
  discord_id: DiscordId;
  /** The users system role. Controls the scopes the user is granted. */
  role: UserRole;
  /** @format date-time */
  registered: string;
}

/** Parametere to unique identify a user */
export type UserIdentifier = {
  /** The name of a user, must be unique across all members. This name, in combination with the password, will be used to obtain a JWT. */
  username?: UserName;
  /** Discord ID (Snowflake) */
  discord_id?: DiscordId;
  /** The user ID */
  user_id?: number;
};

/** A Task to be performed */
export interface Task {
  id: number;
  group_id: number;
  /**
   * The name of the task
   * @example "Gacha#12"
   */
  name: string;
  /**
   * The kind of task
   * @example "GACHA_FEED"
   */
  kind: string;
  /** @format json */
  data: string;
  /** @format date-time */
  created: string;
}

/** Encapsulates a set of related tasks to be performed */
export interface Taskgroup {
  id: number;
  /** The data of a HLNA user. Does not contain any sensitive data (e.g. passwords). */
  owner: User;
  /**
   * The priority of the taskgroup, only in a configuration context.
   * @example 1
   */
  priority?: number;
  /** Whether the taskgroup is enabled, only in a configuration context. */
  enabled?: boolean;
  /** Whether the association with this taskgroup allows modifications */
  editable: boolean;
  /**
   * The name of the taskgroup
   * @example "Gacha Tower"
   */
  name: string;
  /**
   * A short description of the taskgroup
   * @example "Checks the towers on 9263"
   */
  description?: string | null;
  /**
   * The kind of taskgroup
   * @example "CRAFTING"
   */
  kind: string;
  /** The server to perform the tasks on */
  server: string;
  /** @format date-time */
  created: string;
  /** The names of the configurations that this group is used in. */
  uses?: string[];
  tasks?: Task[];
}

/** Encapsulates a taskgroups into a runnable configuration */
export interface Configuration {
  /** A unique identifier for the configuration */
  id: number;
  /** The data of a HLNA user. Does not contain any sensitive data (e.g. passwords). */
  owner: User;
  /** The name of the configuration, unique per user. */
  name: string;
  /** An optional description of the configuration. */
  description?: string;
  /**
   * When this configuration was created
   * @format date-time
   */
  created: string;
  /** The taskgroups that are bound to this configuration */
  taskgroups: Taskgroup[];
  /** The tribe(s) this configuration is shared from */
  shared_from: TribeName[];
}

/** An Error occured */
export interface ErrorMessage {
  message: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title HLNA REST
 * @version 1.0.0
 */
export class HlnaApi<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  login = {
    /**
     * No description
     *
     * @name Login
     * @summary Authenticate to receive a JWT for subsequent requests
     * @request POST:/login
     */
    login: (
      data: {
        /** Parametere to unique identify a user */
        user: UserIdentifier;
        password: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<JWTData, ErrorMessage>({
        path: `/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
  proxyLogin = {
    /**
     * No description
     *
     * @name ProxyLogin
     * @summary Receive a JWT to authenticate yourself as another user.
     * @request POST:/proxy-login
     * @secure
     */
    proxyLogin: (data: UserIdentifier, params: RequestParams = {}) =>
      this.request<JWTData, ErrorMessage>({
        path: `/proxy-login`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  configs = {
    /**
     * No description
     *
     * @name CreateConfiguration
     * @summary Create a new configuration
     * @request POST:/configs
     * @secure
     */
    createConfiguration: (
      data: {
        name: string;
        description?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<Configuration, ErrorMessage>({
        path: `/configs`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name GetUserConfigurations
     * @summary Gets all configurations this user is associated with
     * @request GET:/configs/@me
     * @secure
     */
    getUserConfigurations: (params: RequestParams = {}) =>
      this.request<Configuration[], ErrorMessage>({
        path: `/configs/@me`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name AddTaskgroup
     * @summary Adds a taskgroup to this configuration
     * @request POST:/configs/{config_id}/taskgroups/{taskgroup_id}
     * @secure
     */
    addTaskgroup: (
      configId: number,
      taskgroupId: number,
      data: {
        /**
         * The priority of this taskgroup in the configuration
         * @example "0 (highest)"
         */
        priority: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, ErrorMessage>({
        path: `/configs/${configId}/taskgroups/${taskgroupId}`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @name RemoveTaskgroup
     * @summary Adds a taskgroup to this configuration
     * @request DELETE:/configs/{config_id}/taskgroups/{taskgroup_id}
     * @secure
     */
    removeTaskgroup: (
      configId: number,
      taskgroupId: number,
      params: RequestParams = {},
    ) =>
      this.request<void, ErrorMessage>({
        path: `/configs/${configId}/taskgroups/${taskgroupId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @name AddTribe
     * @summary Adds a tribe to this configuration
     * @request POST:/configs/{config_id}/tribes/{tribe_id}
     * @secure
     */
    addTribe: (configId: number, tribeId: number, params: RequestParams = {}) =>
      this.request<void, ErrorMessage>({
        path: `/configs/${configId}/tribes/${tribeId}`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @name RemoveTribe
     * @summary Removes a tribe from this configuration
     * @request DELETE:/configs/{config_id}/tribes/{tribe_id}
     * @secure
     */
    removeTribe: (
      configId: number,
      tribeId: number,
      params: RequestParams = {},
    ) =>
      this.request<void, ErrorMessage>({
        path: `/configs/${configId}/tribes/${tribeId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
  };
  taskgroups = {
    /**
     * No description
     *
     * @name CreateTaskgroup
     * @summary Create a new task
     * @request POST:/taskgroups
     * @secure
     */
    createTaskgroup: (
      data: {
        name: string;
        description?: string;
        kind: string;
        server: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<Taskgroup, ErrorMessage>({
        path: `/taskgroups`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name AddTask
     * @summary Create a new task
     * @request POST:/taskgroups/{taskgroup_id}/tasks
     * @secure
     */
    addTask: (
      taskgroupId: number,
      data: {
        name: string;
        kind: string;
        /** @format json */
        data: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<Task, ErrorMessage>({
        path: `/taskgroups/${taskgroupId}/tasks`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name RemoveTask
     * @summary Create a new task
     * @request DELETE:/taskgroups/{taskgroup_id}/tasks/{task_id}
     * @secure
     */
    removeTask: (
      taskgroupId: number,
      taskId: number,
      params: RequestParams = {},
    ) =>
      this.request<void, ErrorMessage>({
        path: `/taskgroups/${taskgroupId}/tasks/${taskId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
  };
  tribes = {
    /**
     * @description Returns data of a tribe such as its name, creation date and members.
     *
     * @name GetTribe
     * @summary Gets the data of a given tribe by its ID
     * @request GET:/tribes/{tribe_id}
     * @secure
     */
    getTribe: (tribeId: number, params: RequestParams = {}) =>
      this.request<Tribe, ErrorMessage>({
        path: `/tribes/${tribeId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name UpdateTribe
     * @summary Change properties of this Tribe
     * @request PATCH:/tribes/{tribe_id}
     * @secure
     */
    updateTribe: (
      tribeId: number,
      data: {
        /** The name of a tribe created by a user */
        name: TribeName;
      },
      params: RequestParams = {},
    ) =>
      this.request<Tribe, ErrorMessage>({
        path: `/tribes/${tribeId}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name CreateTribe
     * @summary Create a new tribe which logically groups users together
     * @request POST:/tribes
     * @secure
     */
    createTribe: (
      data: {
        /** The name of a tribe created by a user */
        name: TribeName;
      },
      params: RequestParams = {},
    ) =>
      this.request<Tribe, ErrorMessage>({
        path: `/tribes`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name AddTribeMembers
     * @summary Adds one or more members to the tribe
     * @request POST:/tribes/{tribe_id}/members
     * @secure
     */
    addTribeMembers: (
      tribeId: number,
      data: {
        members: UserIdentifier[];
        /** The kind of association a user has with a tribe */
        rank: TribeRank;
      },
      params: RequestParams = {},
    ) =>
      this.request<Tribe, ErrorMessage>({
        path: `/tribes/${tribeId}/members`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name AddTribemember
     * @summary Removes the tribemember from this tribe
     * @request POST:/tribes/{tribe_id}/members/{user_id}
     * @secure
     */
    addTribemember: (
      tribeId: number,
      userId: UserId,
      params: RequestParams = {},
    ) =>
      this.request<void, ErrorMessage>({
        path: `/tribes/${tribeId}/members/${userId}`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @name RemoveTribemember
     * @summary Removes the tribemember from this tribe
     * @request DELETE:/tribes/{tribe_id}/members/{user_id}
     * @secure
     */
    removeTribemember: (
      tribeId: number,
      userId: UserId,
      params: RequestParams = {},
    ) =>
      this.request<Tribe, ErrorMessage>({
        path: `/tribes/${tribeId}/members/${userId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name UpdateTribemember
     * @summary Updates the tribemembers data in this tribe
     * @request PATCH:/tribes/{tribe_id}/members/{user_id}
     * @secure
     */
    updateTribemember: (
      tribeId: number,
      userId: UserId,
      data: {
        /** The kind of association a user has with a tribe */
        rank: TribeRank;
      },
      params: RequestParams = {},
    ) =>
      this.request<Tribe, ErrorMessage>({
        path: `/tribes/${tribeId}/members/${userId}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  users = {
    /**
     * No description
     *
     * @name GetUsers
     * @summary Returns a list of users matching the query
     * @request GET:/users
     * @secure
     */
    getUsers: (
      query?: {
        /** Filter users by their role */
        role?: UserRole;
        /** Filter users by a discord ID */
        discord_id?: DiscordId;
        /** Filter users by a name */
        name?: UserName;
      },
      params: RequestParams = {},
    ) =>
      this.request<User[], ErrorMessage>({
        path: `/users`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name CreateUser
     * @summary Create a new user
     * @request POST:/users
     * @secure
     */
    createUser: (
      data: {
        /** The name of a user, must be unique across all members. This name, in combination with the password, will be used to obtain a JWT. */
        name: UserName;
        /** Discord ID (Snowflake) */
        discord_id: DiscordId;
        /** The users system role. Controls the scopes the user is granted. */
        role: UserRole;
        /**
         * @minLength 6
         * @maxLength 20
         */
        password: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<User, ErrorMessage>({
        path: `/users`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name GetCurrentUser
     * @summary Returns your user data
     * @request GET:/users/me
     * @secure
     */
    getCurrentUser: (params: RequestParams = {}) =>
      this.request<User, ErrorMessage>({
        path: `/users/me`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Provides the non sensitive data of a user given their unique id. Invoking this endpoint requires administrative scopes.
     *
     * @name GetUser
     * @summary Returns a user by its ID
     * @request GET:/users/{user_id}
     * @secure
     */
    getUser: (userId: number, params: RequestParams = {}) =>
      this.request<User, ErrorMessage>({
        path: `/users/${userId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Gets all Tribes that the user is a part of, regardless of the role
     *
     * @name GetUserTribes
     * @summary Returns all tribes a user is a part of
     * @request GET:/users/{user_id}/tribes
     * @secure
     */
    getUserTribes: (userId: number, params: RequestParams = {}) =>
      this.request<Tribe[], ErrorMessage>({
        path: `/users/${userId}/tribes`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Gets all Tribes that the user is a part of, regardless of the role
     *
     * @name GetCurrentUserTribes
     * @summary Returns all tribes the user is a part of
     * @request GET:/users/me/tribes
     * @secure
     */
    getCurrentUserTribes: (params: RequestParams = {}) =>
      this.request<Tribe[], ErrorMessage>({
        path: `/users/me/tribes`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
}
