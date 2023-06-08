/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/* eslint-disable no-unused-expressions */

import {
  html, fixture, expect,
} from '@open-wc/testing';
import '../../src/views/plugin-renderer/plugin-renderer.js';
import '../../src/components/block-list/block-list.js';
import '../../src/components/block-renderer/block-renderer.js';
import sinon from 'sinon';
import { decorate } from '../../src/plugins/blocks/blocks.js';
import { APP_EVENTS, PLUGIN_EVENTS } from '../../src/events/events.js';
import { EventBus } from '../../src/events/eventbus.js';
import AppModel from '../../src/models/app-model.js';

describe('Blocks Plugin', () => {
  describe('decorate()', () => {
    let container;

    beforeEach(async () => {
      AppModel.init();
      container = await fixture(html`<plugin-renderer></plugin-renderer>`);
      AppModel.appStore.context = {
        activePlugin: {
          config: {
            title: 'Blocks',
            searchEnabled: true,
          },
          decorate: () => {},
          path: '../../src/plugins/blocks/blocks.js',
        },
      };

      const pluginLoadedEvent = new CustomEvent(APP_EVENTS.PLUGIN_LOADED);
      EventBus.instance.dispatchEvent(pluginLoadedEvent);
    });

    it('should render a list of blocks', async () => {
      const mockData = [{ name: 'Cards', url: 'https://main--helix-test-content-onedrive--adobe.hlx.page/block-library-tests/blocks/cards/cards', path: '/block-library-tests/blocks/cards/cards' }];

      await decorate(container, mockData);

      const blockLibrary = container.querySelector('.block-library');
      const blocks = blockLibrary.querySelector('sp-split-view .menu .list-container block-list').shadowRoot.querySelectorAll('sp-sidenav-item');
      expect(blocks.length).to.equal(6);
      expect(blocks[0].getAttribute('label')).to.equal('Cards');
      expect(blocks[1].getAttribute('label')).to.equal('cards');
      expect(blocks[2].getAttribute('label')).to.equal('cards (logos)');
    });

    it('should render any valid path and ignore any invalid path', async () => {
      const mockData = [
        { name: 'Columns', url: 'https://main--helix-test-content-onedrive--adobe.hlx.page/block-library-tests/blocks/columns/path-does-not-exist', path: '/block-library-tests/blocks/columns/path-does-not-exist' },
        { name: 'Cards', url: 'https://main--helix-test-content-onedrive--adobe.hlx.page/block-library-tests/blocks/cards/cards', path: '/block-library-tests/blocks/cards/cards' }];

      await decorate(container, mockData);

      const blockLibrary = container.querySelector('.block-library');
      const blocks = blockLibrary.querySelector('sp-split-view .menu .list-container block-list').shadowRoot.querySelectorAll('sp-sidenav-item');
      expect(blocks.length).to.equal(6);
      expect(blocks[0].getAttribute('label')).to.equal('Cards');
      expect(blocks[1].getAttribute('label')).to.equal('cards');
      expect(blocks[2].getAttribute('label')).to.equal('cards (logos)');
    });

    it('should render a toast & empty results message if loading all blocks failed', async () => {
      const eventSpy = sinon.spy();
      const mockData = [{ name: 'Cards', url: 'https://main--helix-test-content-onedrive--adobe.hlx.page/block-library-tests/blocks/columns/path-does-not-exist', path: '/block-library-tests/blocks/columns/path-does-not-exist' }];

      container.addEventListener(PLUGIN_EVENTS.TOAST, eventSpy);
      await decorate(container, mockData);

      const blockLibrary = container.querySelector('.block-library');
      const blocks = blockLibrary.querySelector('sp-split-view .menu .list-container block-list').shadowRoot.querySelectorAll('sp-sidenav-item');
      expect(blocks.length).to.equal(0);

      expect(eventSpy.calledOnce).to.be.true;
    });

    it.skip('should expand a block if it matches the query', async () => {
      const mockData = [{ name: 'Cards', path: 'https://main--helix-test-content-onedrive--adobe.hlx.page/block-library-tests/blocks/cards/cards' }];

      await decorate(container, mockData);
      const blockLibrary = container.querySelector('.block-library');
      const blocks = blockLibrary.querySelector('sp-split-view .menu .list-container block-list').shadowRoot.querySelectorAll('sp-sidenav-item');

      expect(blocks.length).to.equal(2);
      expect(blocks[0].getAttribute('label')).to.equal('Cards');
      expect(blocks[0].getAttribute('expanded')).to.exist;
    });

    it.skip('should render no results if no matches to the query', async () => {
      const mockData = [{ name: 'Cards', path: 'https://main--helix-test-content-onedrive--adobe.hlx.page/block-library-tests/blocks/cards/cards' }];

      await decorate(container, mockData, 'abc');
      const blocks = container.querySelectorAll('sp-sidenav-item');
      expect(blocks.length).to.equal(0);

      container.querySelector('.message-container');
      expect(container.querySelector('.message-container')).to.be.visible;
    });

    it.skip('should expand a block if it matches the query and copy block', async () => {
      const eventSpy = sinon.spy();
      const mockData = [{ name: 'Cards', path: 'https://main--helix-test-content-onedrive--adobe.hlx.page/block-library-tests/blocks/cards/cards' }];

      await decorate(container, mockData, 'Authored Name');
      const blocks = container.querySelectorAll('sp-sidenav-item');
      expect(blocks.length).to.equal(2);
      expect(blocks[0].getAttribute('label')).to.equal('Cards');
      expect(blocks[0].getAttribute('expanded')).to.exist;

      container.addEventListener(PLUGIN_EVENTS.TOAST, eventSpy);

      const blockItem = blocks[1];
      blockItem.dispatchEvent(new Event('click'));
      expect(eventSpy.calledOnce).to.be.true;
    });
  });
});
