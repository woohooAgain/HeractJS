﻿/// <reference path='../../typings/main.d.ts' />

import * as React from 'react';
import * as DOM from 'react-dom';

import {TaskBar} from './TaskBar'
import {TaskLink} from './TaskLink'
import {InfoPopup} from './Popups/InfoPopup'
import {ActionChartPopup} from './Popups/ActionChartPopup'
import {ActionTasklinePopup} from './Popups/ActionTasklinePopup'
import {ModalWindow} from './Popups/ModalWindow'
import {Timeline}  from './Timeline'
import {GanttToolbar}  from './Toolbar'
import {AppMediator} from '../../scripts/services/ApplicationMediator'

const GCMediator: any = AppMediator.getInstance();

export class ChartView extends React.Component<any, any> {

    constructor() {
        super();
        this.state = {
            timeLine: GCMediator.getState().timeLine,
            columnWidth: GCMediator.getState().columnWidth,
            elementHeight: 24,
            displayingElements: [],
            displayingLinks: [],
            batchSize: 30,
            startPosition: 0,
            endPosition: Math.round(document.documentElement.clientHeight / 24) + 30
        };
        document.onwheel = function (event: any) {
            if (event.ctrlKey) {
                this.updateTimeline();
            } else {
                const currentScroll: number = GCMediator.getState().scrollPosition;
                let scrollPosition: number = Math.round(event.deltaY / 24) + currentScroll;
                if (scrollPosition <= 0 && currentScroll !== 0) {
                    scrollPosition = 0;
                }

                if (scrollPosition >= 0) {
                    this.buildElements(scrollPosition);
                }
            }
            event.preventDefault();
            event.stopPropagation();
        }.bind(this);
        GCMediator.subscribe(function () {
            const change: any = GCMediator.getLastChange();
            if (change) {
                switch (change.type) {
                    case 'completeItemCreating':
                    case 'completeItemRemoving':
                        this.rebuildElements();
                        break;
                    case 'completeItemEditing':
                        this.updateElements(change.data);
                        break;
                    case 'scrollGrid':
                        this.scrollChart(change.data);
                        break;
                    case 'setTimelineStep':
                        this.setState({
                            timeLine: GCMediator.getState().timeLine,
                            columnWidth: GCMediator.getState().columnWidth
                        });
                        break;
                    default:
                        break;
                }
            }
        }.bind(this));
    }

    private componentDidMount() {
        this.rebuildElements();
        document.getElementById('ganttChart').onmousedown = (event: MouseEvent) => {
            const eventTarget = event.target as any;

            if (eventTarget.classList[0] === 'barSelectBody' && eventTarget.tagName !== 'BUTTON') {
                const view: any = document.getElementById('ganttChart');
                const timeline: any = document.getElementById('timelineContainer');
                const startScroll: number = view.scrollLeft;
                const startPoint: number = event.pageX;
                const currentState: any = GCMediator.getState();
                document.onmousemove = (event: MouseEvent) => {
                    if (!currentState.isPanning) {
                        GCMediator.dispatch({ type: 'startPanning' });
                        document.body.style.webkitUserSelect = 'none';
                    }
                    view.scrollLeft = startPoint - event.pageX + startScroll;
                    timeline.scrollLeft = startPoint - event.pageX + startScroll;
                };
                document.onmouseup = () => {
                    GCMediator.dispatch({ type: 'stopPanning' });
                    document.body.style.webkitUserSelect = 'inherit';
                    document.onmousemove = null;
                    document.onmouseup = null;
                };
            }
        };

        document.onclick = (event: MouseEvent) => {
            const eventTarget = event.target as any;
            if (eventTarget.tagName !== 'BUTTON') {
                GCMediator.dispatch({ type: 'hideAllPopups' });
                GanttToolbar.hideViewModeDropdown();
            }
        }
    }

    private shouldComponentUpdate(nextProps: any, nextState: any) {
        if (this.state.displayingElements !== nextState.displayingElements ||
            this.state.timeLine !== nextState.timeLine ||
            this.state.displayingLinks !== nextState.displayingLinks) {
            return true;
        } else {
            return false;
        }
    }

    private scrollChart(position: number) {
        const view: any = document.getElementById('ganttChart');

        let difference = 24 * position - view.scrollTop;
        let perTick = difference / 30;
        if (this.state.interval) {
            clearInterval(this.state.interval);
            this.state.interval = null;
        }
        let interval = setInterval(() => {
            view.scrollTop = view.scrollTop + perTick;
            if ((view.scrollTop >= 24 * position && perTick > 0) || (view.scrollTop <= 24 * position && perTick < 0)) {
                view.scrollTop = 24 * position;
                clearInterval(this.state.interval);
                this.state.interval = null;
            }
        }, 2)
        this.setState({
            interval: interval
        })
    }

    private updateTimeline() {
        const currentState = GCMediator.getState();
        switch (GCMediator.getState().timelineStep) {
            case 0:
                GCMediator.dispatch({
                    type: 'setTimelineStep',
                    data: 1
                });
                break;
            case 1:
                GCMediator.dispatch({
                    type: 'setTimelineStep',
                    data: 2
                });
                break;
            case 2:
                GCMediator.dispatch({
                    type: 'setTimelineStep',
                    data: 3
                });
                break;
            case 3:
                GCMediator.dispatch({
                    type: 'setTimelineStep',
                    data: 0
                });
                break;
            default:
                this.state.timelineData = currentState.timelineDay;
        }
    }

    private buildElements(scrollPosition: number) {
        const state = this.state;
        let startPos: number = state.startPosition;
        let endPos: number = state.endPosition;
        const batchSize: number = state.batchSize;
        let elements;
        if (endPos - scrollPosition < 31 + batchSize || (startPos - scrollPosition < batchSize && startPos !== 0)) {
            const newStartPos: number = scrollPosition - batchSize;
            startPos = newStartPos > 0 ? newStartPos : 0;
            endPos = scrollPosition + 31 + batchSize;
            elements = GCMediator.getState().items.slice(startPos, endPos);
            document
                .getElementById('ganttChartView')
                .style.height = (document.documentElement.clientHeight + state.elementHeight * endPos).toString();

            this.setState({
                displayingElements: elements,
                startPosition: startPos,
                endPosition: endPos
            },
                function (elements) {
                    let links = [];
                    for (let i = 0; i < elements.length - 2; i++) {
                        if (elements[i].link) {
                            elements[i].link.from = elements[i].id;
                            links.push(elements[i].link);
                        }
                    }
                    this.setState({
                        displayingLinks: links
                    });
                    GCMediator.dispatch({
                        type: 'scrollGrid',
                        data: scrollPosition
                    });
                }.bind(this, elements));
        } else {
            GCMediator.dispatch({
                type: 'scrollGrid',
                data: scrollPosition
            });
        }
    }

    private rebuildElements() {
        let timelineTasks = GCMediator.getState().timelineTasks;
        let timelineMilestones = GCMediator.getState().timelineMilestones;
        let elements = GCMediator.getState().items.slice(this.state.startPosition, this.state.endPosition);
        let timelineCallouts = GCMediator.getState().timelineCallouts;
        const links = [];
        for (let i = 0; i < elements.length - 2; i++) {
            if (elements[i].link) {
                elements[i].link.from = elements[i].id;
                links.push(elements[i].link);
            }
        }

        for (let i = 0; i < elements.length - 2; i++) {
            if (elements[i].timelineDisplay) {
                if (elements[i].type !== 'milestone') {
                    timelineTasks.push(elements[i]);
                } else {
                    timelineMilestones.push(elements[i]);
                }
            } else if (elements[i].calloutDisplay) {
                timelineCallouts.push(elements[i])
            }
        }
        this.setState({
            displayingElements: elements
        },
            function () {
                this.setState({
                    displayingLinks: links
                })
            }.bind(this))
    }

    private updateElements(newData) {
        const currentState = GCMediator.getState();
        const selectedElementId = newData.selectedTask || currentState.selectedTasks[0].id;
        const elements = this.state.displayingElements;

        if (selectedElementId) {
            this.setState({
                displayingElements: elements
            },
                function () {
                    const links = [];
                    for (let i = 0; i < elements.length - 2; i++) {
                        if (elements[i].link) {
                            elements[i].link.from = elements[i].id;
                            links.push(elements[i].link);
                        }
                    }
                    this.setState({
                        displayingLinks: links
                    })
                }.bind(this))
        }
    }

    public render() {
        const bars: Array<TaskBar> = this.state.displayingElements.map((ganttBar: any) => {
            return React.createElement(TaskBar, {
                key: ganttBar.id,
                data: ganttBar
            });
        });
        const links: Array<TaskLink> = this.state.displayingLinks.map((link: any) => {
            if (link) {
                return React.createElement(TaskLink, {
                    ref: link.id,
                    key: link.id,
                    data: link
                });
            }
        });
        const timeline: Array<Timeline> = this.state.timeLine.map((timeLineItem: any) => {
            return React.createElement(Timeline, {
                key: timeLineItem.id,
                data: timeLineItem
            });
        });
        return React.createElement('div', {
            id: 'ganttChartContainer',
            className: 'ganttChartContainer'
        },
            React.createElement('div', {
                id: 'timelineContainer',
                className: 'timelineContainer'
            },
                React.createElement('svg', {
                    className: 'ganttTimeline',
                    id: 'ganttTimeline'
                }, timeline)),
            React.createElement('div', {
                id: 'ganttChart',
                className: 'ganttChart'
            },
                React.createElement(InfoPopup, {
                    ref: 'infoPopup'
                }),
                React.createElement(ActionChartPopup, {
                    ref: 'actionChartPopup'
                }),
                React.createElement(ActionTasklinePopup, {
                    ref: 'actionTasklinePopup'
                }),
                React.createElement(ModalWindow, {
                    ref: 'modalWindow'
                }),
                React.createElement('svg', {
                    className: 'ganttChartView',
                    id: 'ganttChartView'
                }, React.createElement('filter', {
                    id: 'blur-filter',
                    x: -2,
                    y: -2,
                    width: '200%',
                    height: '200%'
                },
                    React.createElement('feGaussianBlur', {
                        in: 'SourceGraphic',
                        stdDeviation: '2'
                    })),
                    React.createElement('defs', {
                    },
                        React.createElement('filter', {
                            id: 'shadowFilter',
                            x: 0,
                            y: 0,
                            width: '200%',
                            height: '200%'
                        },
                            React.createElement('feOffset', {
                                dx: '1',
                                dy: '1'
                            }),
                            React.createElement('feGaussianBlur', {
                                in: 'SourceAlpha',
                                stdDeviation: '2'
                            }),
                            React.createElement('feComponentTransfer', {
                            }, React.createElement('feFuncA', {
                                type: 'linear',
                                slope: '0.6'
                            })),
                            React.createElement('feBlend', {
                                in: 'SourceGraphic',
                                in2: 'blurOut',
                                mode: 'normal'
                            })
                        )
                    ),
                    React.createElement('marker', {
                        id: 'triangle',
                        viewBox: '0 0 40 20',
                        refX: 20,
                        refY: 0,
                        markerUnits: 'strokeWidth',
                        markerWidth: 6,
                        markerHeight: 2,
                        orient: '0'
                    },
                        React.createElement('path', {
                            d: 'M 0 0 L 40 0 L 20 20 z'
                        })),
                    bars,
                    links
                )
            )
        );
    }
}
