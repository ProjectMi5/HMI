# HMI Master

The HMI for the Mi5 HMI
Currently developing the Serviceskill Interface.

## Installation

1. Download and install [Node.js](http://nodejs.org/download/) (runs only with node v0.12.17)
2. Download an clone the repository. Make sure you have the 
   [briefcase-branch](https://github.com/ProjectMi5/HMI/tree/briefcase)
3. In a command line window, browse in the repository and execute
  1. `npm install` // this installs the required node modules for the HMI
  2. `npm intsall forever -g` // this installs the forever module globally
4. Run `HMI_Start.cmd` or `HMI_Forever.cmd`

Note: The forever module and file is kind of a dirty hack. Whenever the HMI crashes, 
 it automatically gets restarted.
Note: If you use the `HMI_Forever.cmd` and kill it, make sure you also end the node.exe 
 process in the task manager. The process keeps running (thanks to _forever_),
 and then can lead to a PORT conflict, when restarting.

## Additional information

You can also run the HMI using the node command line. Run then:

* _node app.js_ (this will use the live server configuration and Port 80)

It is possible to use different server confiugrations and ports from the command line. 
For example:

* _node app.js -server=hmitest -port=3000_

* _node app.js -server=hmitest_ (this will use Port 80)

## Automatic Output Module

The automatic output module connects to a camera via zeroMQ. 
Installing zeroMQ can be quite a challange.

1. Install [Python 2.7](http://www.python.org/) (tested with v2.7.12), and update path in System control panel to match installation directory, the installer does not do this automatically.
2. Use the zeroMQ installer for Windows downloadable [here](http://zeromq.org/distro:microsoft-windows) (tested: [ZeroMQ-4.0.4~miru1.0-x64.exe](http://miru.hk/archive/ZeroMQ-4.0.4~miru1.0-x64.exe))
3. Install the [Windows Software Development Kit](https://developer.microsoft.com/de-de/windows/downloads/windows-10-sdk) (testet with Windows 10.0.14393.33)
4. Make sure _Visual Studo 2013 C++_ is installed. (Not sure if this is necessary.)
4. Restart your PC.
5. In the command prompt, run `node -v`, `npm -v`, as well as `python --version` and make sure to use node version 0.12.17, npm version 4.0.2 and Python 2.7.12.
6. In the command prompt, navigate to the HMI folder.
7. Run `npm install zmq`. The _zmq.node_ file binds _zmq_ to the right version of _node.js_.

To use the Automatic Output Module, it is finally required, to add the following lines to the _config.js_ file.

```javascript
  config.AutomaticOutputModule        = "tcp://localhost:5555";
  config.EnableAutomaticOutputModule  = true;
  config.AutomaticOutputModuleAttempts  = 3;
 ```

If you want to test the Automatic Output Module, run the file _./examples/zeroMQserver.js_ while the HMI is running.

## Revision
Last Update: 2016-11-08 Dominik Serve

---
Deprecated below.

## Developing

* Sapmleserver: 
./misc/myTestSampleServerTriple.js
This Server starts 3 instances with the same variable tree on the ports 4334, 4335, 4336

* JSCS - Control Source:
jscs .

* Information Mocha Testing
http://unitjs.com/guide/mocha.html

* In the misc/ folder you can find a uaexpert file, that connects to this localhost server.
Use this tool to check OPC UA variables.
Also check with the tool, if the sample server is implemented correctly, if something fails.
!!! See following point for Server-Issues in UAExpert

* When the variable-architecture changes, OPC UA is not able to subscribe to a variable anymore.
The Message is: BadDataEncodingUnsupported
Therefore it is necessary to delete the sampleserver from the uaexpert client and then add it again.

## Testing

* For developing purposes, there is a folder called test/ in which all the unit-tests are stored.

* Run: npm test
This executes: "jscs ." and then "mocha" 

* Error Messages:
Sometimes it throws error like certificate, or client.security.
Then just restart both node.js applications some times, and it sould work.

### Tools

Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   

Nodeclipse is free open-source project that grows with your contributions.
