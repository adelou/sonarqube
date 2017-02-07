/*
 * SonarQube
 * Copyright (C) 2009-2016 SonarSource SA
 * mailto:contact AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
package org.sonar.server.user;

import java.util.Collection;
import javax.annotation.CheckForNull;
import org.sonar.db.component.ComponentDto;
import org.sonar.db.user.GroupDto;

public interface UserSession {

  /**
   * Login of the authenticated user. Returns {@code null}
   * if {@link #isLoggedIn()} is {@code false}.
   */
  @CheckForNull
  String getLogin();

  /**
   * NAme of the authenticated user. Returns {@code null}
   * if {@link #isLoggedIn()} is {@code false}.
   */
  @CheckForNull
  String getName();

  /**
   * Database ID of the authenticated user. Returns {@code null}
   * if {@link #isLoggedIn()} is {@code false}.
   */
  @CheckForNull
  Integer getUserId();

  /**
   * The groups that the logged-in user is member of. An empty
   * collection is returned if {@link #isLoggedIn()} is {@code false}.
   */
  Collection<GroupDto> getGroups();

  /**
   * Whether the user is logged-in or anonymous.
   */
  boolean isLoggedIn();

  /**
   * Whether the user has root privileges.
   */
  boolean isRoot();

  /**
   * Ensures that user is root otherwise throws {@link org.sonar.server.exceptions.ForbiddenException}.
   */
  UserSession checkIsRoot();

  /**
   * Ensures that user is logged in otherwise throws {@link org.sonar.server.exceptions.UnauthorizedException}.
   */
  UserSession checkLoggedIn();

  /**
   * Returns {@code true} if the permission is granted on the organization, otherwise {@code false}.
   *
   * If the organization does not exist, then returns {@code false}.
   *
   * Always returns {@code true} if {@link #isRoot()} is {@code true}, even if
   * organization does not exist.
   *
   * @param organizationUuid non-null UUID of organization.
   * @param permission global permission as defined by {@link org.sonar.core.permission.GlobalPermissions}
   */
  boolean hasOrganizationPermission(String organizationUuid, String permission);

  /**
   * Ensures that {@link #hasOrganizationPermission(String,String)} is {@code true},
   * otherwise throws a {@link org.sonar.server.exceptions.ForbiddenException}.
   */
  UserSession checkOrganizationPermission(String organizationUuid, String permission);

  /**
   * Returns {@code true} if the permission is granted to user on the component,
   * otherwise {@code false}.
   *
   * If the component does not exist, then returns {@code false}.
   *
   * Always returns {@code true} if {@link #isRoot()} is {@code true}, even if
   * component does not exist.
   *
   * If the permission is not granted, then the organization permission is _not_ checked.
   * There's _no_ automatic fallback on {@link #hasOrganizationPermission(String, String)}.
   *
   * @param component non-null component.
   * @param permission project permission as defined by {@link org.sonar.core.permission.ProjectPermissions}
   */
  boolean hasComponentPermission(String permission, ComponentDto component);

  /**
   * Using {@link #hasComponentPermission(String, ComponentDto)} is recommended
   * because it does not have to load project if the referenced component
   * is not a project.
   */
  boolean hasComponentUuidPermission(String permission, String componentUuid);

  /**
   * Ensures that {@link #hasComponentPermission(String, ComponentDto)} is {@code true},
   * otherwise throws a {@link org.sonar.server.exceptions.ForbiddenException}.
   */
  UserSession checkComponentPermission(String projectPermission, ComponentDto component);

  /**
   * Ensures that {@link #hasComponentUuidPermission(String, String)} is {@code true},
   * otherwise throws a {@link org.sonar.server.exceptions.ForbiddenException}.
   */
  UserSession checkComponentUuidPermission(String permission, String componentUuid);
}
