package gis.proxy;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.URL;
import java.net.URLDecoder;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class ReqProxy extends HttpServlet{
  /**
   *
   */
  private static final long serialVersionUID = 4191419806910781940L;

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException{
    this.doPost(request, response);
    /*String query = null;
    response.setContentType("text/html;charset=UTF-8");
    request.setCharacterEncoding("UTF-8");
    //query = request.getParameter("url");
    query = request.getQueryString().substring(10);
    System.out.println(query);
    //query = "http://www.google.cn/search?hl=zh-CN&source=hp&q=proxy&btnG=Google+%E6%90%9C%E7%B4%A2&aq=f&oq=";
    if(query == null){
      response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing URL Parameter��");
      return;
    }
    query = URLDecoder.decode(query);
    PrintWriter out = response.getWriter();
    int length = request.getContentLength();
    byte[] bytes = new byte[length];
    //System.out.println(length);
    try{
      URL url = new URL(query);
      BufferedInputStream in = new BufferedInputStream(url.openStream());
      System.out.println(in.read(bytes, 0, length));
      in.close();
      out.print(bytes);
      out.flush();
      out.close();
    }catch(IOException e){
      response.sendError(HttpServletResponse.SC_NOT_FOUND, "Exception:" + e);
    }*/
  }

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException{
    String query = null;
    response.setContentType("text/html;charset=UTF-8");
    request.setCharacterEncoding("UTF-8");
    //query = request.getParameter("url");
    query = request.getQueryString().substring(10);
    System.out.println(query);
    //query = "http://www.google.cn/search?hl=zh-CN&source=hp&q=proxy&btnG=Google+%E6%90%9C%E7%B4%A2&aq=f&oq=";
    if(query == null){
      response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing URL Parameter��");
      return;
    }
    query = URLDecoder.decode(query);
    PrintWriter out = response.getWriter();
    int length = request.getContentLength();
    byte[] bytes = new byte[length];
    //System.out.println(length);
    try{
      URL url = new URL(query);
      BufferedInputStream in = new BufferedInputStream(url.openStream());
      System.out.println(in.read(bytes, 0, length));
      in.close();
      out.print(bytes);
      out.flush();
      out.close();
    }catch(IOException e){
      response.sendError(HttpServletResponse.SC_NOT_FOUND, "Exception:" + e);
    }
  }
}