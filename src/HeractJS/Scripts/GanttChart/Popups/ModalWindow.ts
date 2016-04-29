﻿import * as React from 'react';
import * as DOM from 'react-dom';

export class ModalWindow extends React.Component<any, any> {
    private componentWillMount() {
        this.state = {
            title: 'title',
            startDate: 'Placeholder',
            endDate: 'Placeholder',
            duration: 'Placeholder',
            description: 'description'
        };
    }

    public hide() {
        const item = DOM.findDOMNode(this) as any;
        item.style.display = 'none';
    }

    public show() {
        const item = DOM.findDOMNode(this) as any;
        item.style.display = 'flex';
    }

    public render() {
        return React.createElement('div', {
            id: 'modalWindowWrapper',
            className: 'modalWindowWrapper'
        },
            React.createElement('div', {
                id: 'modalWindow',
                className: 'modalWindow'
            },
                React.createElement('div', {
                    id: 'modalWindowTitle',
                    className: 'modalWindowTitle'
                },
                    React.createElement('input', {
                        type: 'text',
                        className: 'infoPopupTitle',
                        onChange: null,
                        defaultValue: this.state.title
                    })
                ),
                React.createElement('div', {
                    id: 'modalWindowBody',
                    className: 'modalWindowBody'
                },
                    React.createElement('input', {
                        type: 'text',
                        className: 'infoPopupDescription',
                        onChange: null,
                        defaultValue: this.state.description
                    }),
                    React.createElement('span', {
                        className: 'GCInputLabel'
                    }, 'Task start: '),
                    React.createElement('input', {
                        id: 'modalWindowInputStart',
                        type: 'datetime-local',
                        className: 'modalWindowInput',
                        onChange: null,
                        defaultValue: this.state.startDate
                    }),
                    React.createElement('span', {
                        className: 'GCInputLabel'
                    }, 'Task finish: '),
                    React.createElement('input', {
                        id: 'modalWindowInputFinish',
                        type: 'datetime-local',
                        className: 'modalWindowInput',
                        onChange: null,
                        defaultValue: this.state.completeDate
                    }),
                    React.createElement('span', {
                        className: 'GCInputLabel'
                    }, 'Task duration: '),
                    React.createElement('input', {
                        id: 'modalWindowInputDuration',
                        type: 'datetime-local',
                        className: 'modalWindowInput',
                        onChange: null,
                        defaultValue: this.state.completeDate
                    })
                ),
                React.createElement('div', {
                    id: 'modalWindowButtons',
                    className: 'modalWindowButtons'
                },
                    React.createElement('button', {
                        onMouseDown: this.hide.bind(this),
                        id: 'modalWindowButtonOk',
                        type: 'datetime-local',
                        className: 'modalWindowButtonOk'
                    }, 'Ok'),
                    React.createElement('button', {
                        onMouseDown: this.hide.bind(this),
                        id: 'modalWindowButtonCancel',
                        type: 'datetime-local',
                        className: 'modalWindowButtonCancel'
                    }, 'Cancel')
                )
            )
        );
    }
};
