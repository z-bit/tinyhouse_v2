# Cloud Computing

> 📖 This lesson's lecture slides can be found - [here](./protected/lecture-slides.pdf).

We've finished building the application that we've wanted so we'll now focus on deployment. There's no use in having a great app if we can't deploy it for others to use!

Before we dive into what form of deployment we're going to conduct, let's talk about an important topic that might be obvious to some and pretty new to others, and that is **cloud computing**. [Microsoft Azure's documentation](https://azure.microsoft.com/en-us/overview/what-is-cloud-computing) on cloud computing has a very good paragraph in introducing what this means:

> "... cloud computing is the delivery of computing services—including servers, storage, databases, networking, software, analytics, and intelligence—over the Internet (“the cloud”) to offer faster innovation, flexible resources, and economies of scale..."

Why is the topic of cloud computing important within the concept of deployment? Before cloud computing became widely adopted, if we wanted to deploy an application over the web (like what we want to do with TinyHouse), we most likely had to:

-   Buy the hardware (e.g. CPU, RAM, Hard Drive, Routers, etc.).
-   Install the hardware.
-   Setup networking and security.
-   Install an operating system (e.g. Linux).
-   Install any other required software to run our application (e.g. the Node runtime environment).
-   And once all of the above steps are complete, host our application on the internet.

What happens if our CPU/RAM (or any other piece of hardware) fails? Our app would become offline. What happens if our app becomes very popular and our hardware cannot keep up? Our app would become sluggish and we'll have to buy more hardware. What if there is a usage peak at certain hours of the day? We'll have to buy hardware to handle just that peak, and for the remainder of the day, some of our hardware might be unnecessary to have.

Cloud computing helps address all of these concerns! For the same reasons we're hosting our database in the cloud with [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), we're going to deploy our application to the cloud. By deploying our application to the cloud, we'll have the following advantages:

-   **No maintenance** - no hardware maintenance to perform.
-   **High reliability and availability** - we can configure your app to have multiple instances (i.e. multiple copies) deployed around the globe which minimizes latency and can ensure our app stays online even if one instance fails.
-   **Easier scalability** - no hardware upgrades to perform and scaling can be done with a few button clicks. For some services like [AWS](https://aws.amazon.com/) or [Google Cloud Platform](https://cloud.google.com/), we can even choose to scale automatically depending on the real-time load.

A lot of these factors come into play to lead to **lower overall costs**.

### IaaS vs PaaS vs SaaS

With that said, let's gather and explain some definitions. If you've ever looked into cloud computing, you've probably heard one of these upcoming terms.

#### Infrastructure as a service (IaaS)

Instead of buying racks of hardware, maintaining and updating that hardware, and storing that hardware somewhere in our room, we can "rent" servers or computation power. AWS and Google Cloud (i.e. in particular [Amazon EC2](https://aws.amazon.com/ec2/) and [Google Compute Engine](https://cloud.google.com/compute/)) are IaaS. With an IaaS, **we're still responsible for installing all the software to run our app**.

#### Platform as a service (PaaS)

With PaaS, we get everything from an IaaS solution **plus all the software required to run an application**. In other words, we won't have to worry about installing an Operating System like Linux, or the drivers, or any runtime environments. All we have to do is develop our application and upload it to a PaaS! **Compared with an IaaS solution, there's less customization here**.

#### Software as a service (SaaS)

With SaaS, instead of software being installed on our computer, the software now resides in the cloud. In other words, someone else has a physical server that is running and hosting the software and we're are just accessing a copy of it. The [Maps](https://support.apple.com/en-us/guide/maps/welcome/mac) app on macOS, when used, is physically installed on our computer. As a result, the Maps app is _not_ a SaaS. If we, however, go to [Google Maps ](https://www.google.com/maps) on a browser, we are accessing an application hosted on Google's server. Google Maps (at least the browser version) is a SaaS.

For IaaS and PaaS, the end-user is the developer, the programmer, or in other words, you! These solutions are targeted towards the people **building the application**.

For a SaaS, the end-user is the person that is using the deployed app (e.g. the person logging onto TinyHouse and renting listings).

With these definitions in mind, we'll be using a **PaaS ([Heroku](https://www.heroku.com/))** to deploy our **SaaS app (TinyHouse)**.
