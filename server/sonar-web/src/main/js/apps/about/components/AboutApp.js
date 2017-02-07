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
// @flow
import React from 'react';
import { connect } from 'react-redux';
import keyBy from 'lodash/keyBy';
import { Link } from 'react-router';
import AboutProjects from './AboutProjects';
import EntryIssueTypes from './EntryIssueTypes';
import AboutLanguages from './AboutLanguages';
import AboutCleanCode from './AboutCleanCode';
import AboutQualityModel from './AboutQualityModel';
import AboutQualityGates from './AboutQualityGates';
import AboutLeakPeriod from './AboutLeakPeriod';
import AboutStandards from './AboutStandards';
import AboutScanners from './AboutScanners';
import { searchProjects } from '../../../api/components';
import { getFacet } from '../../../api/issues';
import * as settingsAPI from '../../../api/settings';
import { getCurrentUser } from '../../../store/rootReducer';
import '../styles.css';
import { translate } from '../../../helpers/l10n';

type State = {
  loading: boolean,
  projectsCount?: number,
  issueTypes?: {
    [key: string]: {
      count: number
    }
  },
  customText?: string
};

class AboutApp extends React.Component {
  mounted: boolean;

  props: {
    currentUser: { isLoggedIn: boolean }
  };

  state: State = {
    loading: true
  };

  componentDidMount () {
    this.mounted = true;
    this.loadData();
  }

  componentWillUnmount () {
    this.mounted = false;
  }

  loadProjects () {
    return searchProjects({ ps: 1 }).then(r => r.paging.total);
  }

  loadIssues () {
    return getFacet({ resolved: false }, 'types');
  }

  loadCustomText () {
    return settingsAPI.getSettingValue('sonar.lf.aboutText');
  }

  loadData () {
    Promise.all([
      this.loadProjects(),
      this.loadIssues(),
      this.loadCustomText()
    ]).then(responses => {
      if (this.mounted) {
        const [projectsCount, issues, customText] = responses;
        const issueTypes = keyBy(issues.facet, 'val');
        this.setState({
          projectsCount,
          issueTypes,
          customText,
          loading: false
        });
      }
    });
  }

  render () {
    if (this.state.loading) {
      return null;
    }

    const { customText } = this.state;

    // $FlowFixMe
    const bugs = this.state.issueTypes['BUG'].count;
    // $FlowFixMe
    const vulnerabilities = this.state.issueTypes['VULNERABILITY'].count;
    // $FlowFixMe
    const codeSmells = this.state.issueTypes['CODE_SMELL'].count;

    return (
        <div id="about-page" className="about-page">
          <div className="about-page-container">
            <div className="about-page-entry">
              <div className="about-page-intro">
                <h1 className="big-spacer-bottom">
                  {translate('layout.sonar.slogan')}
                </h1>
                {!this.props.currentUser.isLoggedIn && (
                    <Link to="/sessions/new" className="button button-active big-spacer-right">
                      {translate('layout.login')}
                    </Link>
                )}
                <a className="button" href="https://redirect.sonarsource.com/doc/home.html">
                  {translate('about_page.read_documentation')}
                </a>
              </div>

              <div className="about-page-instance">
                <AboutProjects count={this.state.projectsCount}/>
                <EntryIssueTypes bugs={bugs} vulnerabilities={vulnerabilities} codeSmells={codeSmells}/>
              </div>
            </div>

            {customText != null && customText.length > 0 && (
                <div className="about-page-section" dangerouslySetInnerHTML={{ __html: customText }}/>
            )}

            <AboutLanguages/>

            <AboutQualityModel/>

            <div className="flex-columns">
              <div className="flex-column flex-column-half about-page-group-boxes">
                <AboutCleanCode/>
              </div>
              <div className="flex-column flex-column-half about-page-group-boxes">
                <AboutLeakPeriod/>
              </div>
            </div>

            <div className="flex-columns">
              <div className="flex-column flex-column-half about-page-group-boxes">
                <AboutQualityGates/>
              </div>
              <div className="flex-column flex-column-half about-page-group-boxes">
                <AboutStandards/>
              </div>
            </div>

            <AboutScanners/>
          </div>
        </div>
    );
  }
}

const mapStateToProps = state => ({
  currentUser: getCurrentUser(state)
});

export default connect(mapStateToProps)(AboutApp);
